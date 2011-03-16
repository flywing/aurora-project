package uncertain.ide.eclipse.editor.textpage;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import org.eclipse.core.resources.IFile;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.DocumentEvent;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IDocumentListener;
import org.eclipse.jface.text.ITextListener;
import org.eclipse.jface.text.Position;
import org.eclipse.jface.text.TextEvent;
import org.eclipse.jface.text.source.Annotation;
import org.eclipse.jface.text.source.AnnotationModel;
import org.eclipse.jface.text.source.IAnnotationModel;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IFileEditorInput;
import org.eclipse.ui.editors.text.TextEditor;
import org.eclipse.ui.forms.editor.FormEditor;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

import uncertain.composite.CompositeLoader;
import uncertain.composite.CompositeMap;
import uncertain.ide.eclipse.editor.core.IViewer;
import uncertain.ide.help.AuroraResourceUtil;
import uncertain.ide.help.CustomDialog;
import uncertain.ide.help.LocaleMessage;

public class TextPage extends TextEditor implements IViewer {
	/** The ID of this editor as defined in plugin.xml */
    public static final String EDITOR_ID = "uncertain.ide.eclipse.editor.textpage.TextPage";

    /** The ID of the editor context menu */
    public static final String EDITOR_CONTEXT = EDITOR_ID + ".context";

    /** The ID of the editor ruler context menu */
    public static final String RULER_CONTEXT = EDITOR_CONTEXT + ".ruler";

    public static final String AnnotationType ="uncertain.ide.eclipse.text.valid";
    protected void initializeEditor() {
            super.initializeEditor();
            setEditorContextMenuId(EDITOR_CONTEXT);
            setRulerContextMenuId(RULER_CONTEXT);
    }
	protected static final String textPageId = "textPage";
	public static final String textPageTitle = LocaleMessage.getString("source.file");
	private boolean syc = false;
	private ColorManager colorManager;
	private FormEditor editor;
	private boolean modify = false;
	private boolean ignorceSycOnce = false;
	private List annotatioList = new LinkedList();
	private IAnnotationModel  annotationModel;
	public boolean isIgnorceSycOnce() {
		return ignorceSycOnce;
	}
	public void setIgnorceSycOnce(boolean ignorceSycOnce) {
		this.ignorceSycOnce = ignorceSycOnce;
	}
	public TextPage(FormEditor editor, String id, String title) {
//		super(editor, id, title);
		this.editor = editor;
		setPartName(title);
		setContentDescription(title);
		colorManager = new ColorManager();
		setSourceViewerConfiguration(new XMLConfiguration(colorManager));
		setDocumentProvider(new XMLDocumentProvider());
	}

	public TextPage(FormEditor editor) {
		this(editor, textPageId, textPageTitle);
	}
	private IAnnotationModel getAnnotationModel() {
		if(annotationModel != null)
			return annotationModel;
		annotationModel= getDocumentProvider().getAnnotationModel(getInput());
		if(annotationModel == null){
			annotationModel = new AnnotationModel();
			annotationModel.connect(getInputDocument());
		}
		return annotationModel;
	}
	private void clearHistory(){
		for(Iterator it = annotatioList.iterator();it.hasNext();){
			annotationModel.removeAnnotation((Annotation)it.next());
		}
		annotatioList.clear();
	}
	private void updateAnnotation(SAXException e){
		Throwable rootCause = CustomDialog.getRootCause(e);
		if(rootCause == null ||!( rootCause instanceof SAXParseException))
			return ;
		SAXParseException parseEx = (SAXParseException)e;
		String errorMessage = CustomDialog.getExceptionMessage(e);
		int lineNum = parseEx.getLineNumber()-1;
		int lineOffset = getOffsetFromLine(lineNum);
		int lineLength = Math.max(getLengthOfLine(lineNum),1);
		Position   pos   =   new   Position(lineOffset,lineLength);
		Annotation annotation = new Annotation(AnnotationType,false,errorMessage);
		annotationModel.addAnnotation(annotation,pos);
		annotatioList.add(annotation);
	}
	public void createPartControl(Composite parent) {
		super.createPartControl(parent);
		getInputDocument().addDocumentListener(new IDocumentListener() {
			
			public void documentChanged(DocumentEvent event) {
				annotationModel = getAnnotationModel();
				clearHistory();
				try {
					AuroraResourceUtil.getCompsiteLoader().loadFromString(getInputDocument().get(),"UTF-8");
				} catch (IOException e) {
					CustomDialog.showErrorMessageBox(e);
				} catch (SAXException e) {
					updateAnnotation(e);
				}
				
			}
			
			public void documentAboutToBeChanged(DocumentEvent event) {
				
			}
		});
		getSourceViewer().addTextListener(new ITextListener() {
			public void textChanged(TextEvent event) {
				if (syc) {
					syc = false;
					return;
				}
				//过滤超链接等事件触发
				if(event.getDocumentEvent() == null){
					return ;
				}
				refresh(true);
			}
		});
		
	}

	public void refresh(boolean dirty) {
		if (dirty){
			getEditor().editorDirtyStateChanged();
			setModify(true);
		}
	}
	private FormEditor getEditor(){
		return editor;
	}

	public void refresh(String newContent) {
		if (!newContent.equals(getSourceViewer().getTextWidget().getText())) {
			syc = true;
			getSourceViewer().getTextWidget().setText(newContent);
		}
	}
	public void setSyc(boolean isSyc){
		syc = isSyc;
	}
	public String getContent() {
		return getSourceViewer().getTextWidget().getText();
	}

	public boolean canLeaveThePage() {
		if (!checkContentFormat()) {
			return false;
		}
		return true;
	}

	private boolean checkContentFormat() {
		CompositeMap content = null;
		CompositeLoader loader = AuroraResourceUtil.getCompsiteLoader();;
		try {
			content = loader.loadFromString(getContent());
		} catch (IOException e) {
			return false;
		} catch (SAXException e) {
			return false;
		}
		getSourceViewer().getTextWidget().setText(content.toXML());
		return true;
	}

	public int getCursorLine() {
		return getSourceViewer().getTextWidget().getLineAtOffset(
				getSourceViewer().getSelectedRange().x);
	}

	public IFile getFile() {
		IFile ifile = ((IFileEditorInput) getEditor().getEditorInput()).getFile();
		return ifile;
	}

	public int getOffsetFromLine(int lineNumber) {
		int offset = 0;
		if(lineNumber<0)
			return offset;
		try {
			offset = getInputDocument().getLineOffset(lineNumber);
			if(offset>=getInputDocument().getLength())
				return getOffsetFromLine(lineNumber - 1);
		} catch (BadLocationException e) {
			return getOffsetFromLine(lineNumber - 1);
		}
		return offset;
	}
	public int getLineOfOffset(int offset){
		try {
			return getInputDocument().getLineOfOffset(offset);
		} catch (BadLocationException e) {
			return -1;
		}
	}
	public int getLengthOfLine(int lineNumber) {
		int length = 0;
		if(lineNumber<0)
			return length;
		try {
			length = getInputDocument().getLineLength(lineNumber);
		} catch (BadLocationException e) {
			try {
				length = getInputDocument().getLineLength(lineNumber - 1);
			} catch (BadLocationException e1) {
			}
		}
		return length;
	}
	public void dispose() {
		colorManager.dispose();
		super.dispose();
	}

	public IDocument getInputDocument() {
		IDocument document = getDocumentProvider().getDocument(getInput());
		return document;
	}

	public IEditorInput getInput() {
		return getEditorInput();
	}
	public boolean isModify() {
		return modify;
	}

	public void setModify(boolean modify) {
		this.modify = modify;
	}
}