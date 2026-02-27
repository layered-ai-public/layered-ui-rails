import { application } from "controllers/application"
import ThemeController from "layered_ui/controllers/l_ui/theme_controller"
import MobileNavigationController from "layered_ui/controllers/l_ui/mobile_navigation_controller"
import PanelController from "layered_ui/controllers/l_ui/panel_controller"
import PanelResizeController from "layered_ui/controllers/l_ui/panel_resize_controller"
import PanelButtonController from "layered_ui/controllers/l_ui/panel_button_controller"
import ModalController from "layered_ui/controllers/l_ui/modal_controller"
import TabsController from "layered_ui/controllers/l_ui/tabs_controller"

application.register("l-ui--theme", ThemeController)
application.register("l-ui--mobile-navigation", MobileNavigationController)
application.register("l-ui--panel", PanelController)
application.register("l-ui--panel-resize", PanelResizeController)
application.register("l-ui--panel-button", PanelButtonController)
application.register("l-ui--modal", ModalController)
application.register("l-ui--tabs", TabsController)
