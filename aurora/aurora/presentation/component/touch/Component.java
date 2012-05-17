package aurora.presentation.component.touch;

import java.io.IOException;
import java.util.Map;

import uncertain.composite.CompositeMap;
import uncertain.event.Configuration;
import uncertain.proc.IFeature;
import aurora.presentation.BuildSession;
import aurora.presentation.ViewComponentPackage;
import aurora.presentation.ViewContext;
import aurora.presentation.component.std.config.ComponentConfig;
import aurora.presentation.markup.HtmlPageContext;

@SuppressWarnings("unchecked")
public class Component implements IFeature {
	CompositeMap  view_config;
	protected static final String CLASS = "cls";
	
	public void onPreparePageContent(BuildSession session, ViewContext context) throws IOException {
		addStyleSheet(session, context, "base/touch-all-min.css");
	}
	
	protected String getDefaultClass(BuildSession session, ViewContext context) {
		return "";
	}
	
	
	public void onCreateViewContent(BuildSession session, ViewContext context) throws IOException {
		CompositeMap view = context.getView();
		Map map = context.getMap();		
		
		String clazz = getDefaultClass(session, context);
		String className = view.getString(ComponentConfig.PROPERTITY_CLASSNAME,"");
		if (!"".equals(className)) {
			clazz += " " + className;
		}
		map.put(CLASS, clazz);
	}
	
	
	/**
	 * 加入JavaScript
	 * 
	 * @param session
	 * @param context
	 * @param javascript
	 * @return String
	 */
	protected void addJavaScript(BuildSession session, ViewContext context, String javascript) {
		if (!session.includeResource(javascript)) {
			HtmlPageContext page = HtmlPageContext.getInstance(context);
			String js = session.getResourceUrl(javascript);
			page.addScript(js);
		}
	}

	/**
	 * 加入StyleSheet
	 * 
	 * @param session
	 * @param context
	 * @param style
	 * @return String
	 */
	protected void addStyleSheet(BuildSession session, ViewContext context, String style) {
		if (!session.includeResource(style)) {
			HtmlPageContext page = HtmlPageContext.getInstance(context);
			ViewComponentPackage pkg = session.getPresentationManager().getPackage(view_config);
			String styleSheet = session.getResourceUrl(pkg, style);
			page.addStyleSheet(styleSheet);
		}
	}

    @Override
    public int attachTo(CompositeMap config_data, Configuration config) {
        this.view_config = config_data;
        return IFeature.NORMAL;
    }
}
