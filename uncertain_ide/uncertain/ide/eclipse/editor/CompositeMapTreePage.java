package uncertain.ide.eclipse.editor;

import java.io.File;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.swt.layout.FillLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.ui.IFileEditorInput;
import org.eclipse.ui.forms.IManagedForm;
import org.eclipse.ui.forms.editor.FormEditor;
import org.eclipse.ui.forms.widgets.ScrolledForm;

import uncertain.composite.CompositeLoader;
import uncertain.composite.CompositeMap;
import uncertain.composite.XMLOutputter;
import uncertain.ide.Common;
import uncertain.ide.eclipse.editor.widgets.CustomDialog;

public class CompositeMapTreePage extends CompositeMapPage {

	private CompositeMap data;

	private boolean modify = false;
	BaseCompositeMapViewer baseCompositeMapPage;

	Composite shell;

	public CompositeMapTreePage(FormEditor editor, String id, String title) {
		super(editor, id, title);
	}

	protected void createFormContent(IManagedForm managedForm) {
		ScrolledForm form = managedForm.getForm();
		shell = form.getBody();
		FillLayout layout = new FillLayout();
		shell.setLayout(layout);
		try {
			CompositeLoader loader = new CompositeLoader();
			data = loader.loadByFile(getFile().getAbsolutePath());
			createContent(shell);
		} catch (Exception e) {
			CustomDialog.showExceptionMessageBox(e);
		}
	}
	
	protected File getFile() {
		IFile ifile = ((IFileEditorInput) getEditor().getEditorInput())
				.getFile();
		String fileName = Common.getIfileLocalPath(ifile);
		return new File(fileName);
	}
	
	protected void createContent(Composite shell) {

		baseCompositeMapPage = new BaseCompositeMapViewer(this,data);
		baseCompositeMapPage.createFormContent(shell);
	}


	public void doSave(IProgressMonitor monitor) {
		try {
			File file = getFile();
			XMLOutputter.saveToFile(file, data);
		} catch (Exception e) {
			CustomDialog.showExceptionMessageBox(e);
		}
	}

	public void refresh(boolean dirty) {
		if (dirty) {
			setModify(true);
			getEditor().editorDirtyStateChanged();
		}
		baseCompositeMapPage.refresh(false);
	}

	public void refresh(CompositeMap data) {
		this.data = data;
		baseCompositeMapPage.refresh(data);
	}

	public boolean isModify() {
		return modify;
	}

	public void setModify(boolean modify) {
		this.modify = modify;
	}

	public CompositeMap getData() {
		return data;
	}

	public void setData(CompositeMap data) {
		this.data = data;
	}
	public TreeViewer getTreeViewer(){
		return baseCompositeMapPage.getTreeViewer();
	}
	public CompositeMap getSelection(){
		return baseCompositeMapPage.getSelection();
	}
	public CompositeMap getContent(){
		return data;
		
	}

	public String getFullContent() {
		String encoding = "UTF-8" ;
		String xml_decl = "<?xml version=\"1.0\" encoding=\""+encoding+"\"?>\n";
		return xml_decl+data.toXML();
	}

	public void setContent(CompositeMap content) {
		this.data = content;
		baseCompositeMapPage.refresh(data);
	}
}