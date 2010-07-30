package uncertain.ide.eclipse.editor.textpage.scanners;

import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.rules.IRule;
import org.eclipse.jface.text.rules.IToken;
import org.eclipse.jface.text.rules.RuleBasedScanner;
import org.eclipse.jface.text.rules.Token;

import uncertain.ide.eclipse.editor.textpage.ColorManager;
import uncertain.ide.eclipse.editor.textpage.IXMLColorConstants;
import uncertain.ide.eclipse.editor.textpage.rules.CDataRule;


public class XMLTextScanner extends RuleBasedScanner
{

	public IToken ESCAPED_CHAR;
	public IToken CDATA_START;
	public IToken CDATA_END;
	public IToken CDATA_TEXT;

	IToken currentToken;

	public XMLTextScanner(ColorManager colorManager)
	{

		ESCAPED_CHAR = new Token(new TextAttribute(colorManager.getColor(IXMLColorConstants.ESCAPED_CHAR)));
		CDATA_START = new Token(new TextAttribute(colorManager.getColor(IXMLColorConstants.CDATA)));
		CDATA_END = new Token(new TextAttribute(colorManager.getColor(IXMLColorConstants.CDATA)));
		CDATA_TEXT = new Token(new TextAttribute(colorManager.getColor(IXMLColorConstants.CDATA_TEXT)));
		IRule[] rules = new IRule[2];

		// Add rule to pick up escaped chars
		// Add rule to pick up start of CDATA section
		rules[0] = new CDataRule(CDATA_START, true);
		// Add a rule to pick up end of CDATA sections
		rules[1] = new CDataRule(CDATA_END, false);
		setRules(rules);

	}

	public IToken nextToken()
	{
		IToken token = super.nextToken();
//		System.out.println("xxx:"+((TextAttribute)token.getData()).);
//		while(currentToken == CDATA_START)
//		{
//	
////			this.currentToken = CDATA_TEXT;
//			token = super.nextToken();
//			if(token == CDATA_END){
//				this.currentToken = CDATA_END;
//				return CDATA_TEXT;
//			}
//		}
		if (currentToken == CDATA_START || currentToken == CDATA_TEXT && token != CDATA_END)
		{
			this.currentToken = CDATA_TEXT;
			return CDATA_TEXT;
		}
		this.currentToken = token;
		return token;
	}
}