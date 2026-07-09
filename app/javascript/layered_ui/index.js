import { application } from "controllers/application"
import ThemeController from "layered_ui/controllers/l_ui/theme_controller"
import NavigationController from "layered_ui/controllers/l_ui/navigation_controller"
import NavigationSectionController from "layered_ui/controllers/l_ui/navigation_section_controller"
import PanelController from "layered_ui/controllers/l_ui/panel_controller"
import PanelResizeController from "layered_ui/controllers/l_ui/panel_resize_controller"
import PanelButtonController from "layered_ui/controllers/l_ui/panel_button_controller"
import ModalController from "layered_ui/controllers/l_ui/modal_controller"
import PopoverController from "layered_ui/controllers/l_ui/popover_controller"
import ScrollHintController from "layered_ui/controllers/l_ui/scroll_hint_controller"
import SearchFormController from "layered_ui/controllers/l_ui/search_form_controller"
import TabsController from "layered_ui/controllers/l_ui/tabs_controller"

application.register("l-ui--search-form", SearchFormController)
application.register("l-ui--theme", ThemeController)
application.register("l-ui--navigation", NavigationController)
application.register("l-ui--navigation-section", NavigationSectionController)
application.register("l-ui--panel", PanelController)
application.register("l-ui--panel-resize", PanelResizeController)
application.register("l-ui--panel-button", PanelButtonController)
application.register("l-ui--modal", ModalController)
application.register("l-ui--popover", PopoverController)
application.register("l-ui--scroll-hint", ScrollHintController)
application.register("l-ui--tabs", TabsController)
