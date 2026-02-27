import { Routes, Route } from "react-router-dom"
import { AppShell } from "@layered-ui/components/layout"

import Welcome from "./pages/Welcome"
import Buttons from "./pages/Buttons"
import Badges from "./pages/Badges"
import Notices from "./pages/Notices"
import Surfaces from "./pages/Surfaces"
import Forms from "./pages/Forms"
import FormErrors from "./pages/FormErrors"
import Tables from "./pages/Tables"
import Tabs from "./pages/Tabs"
import Typography from "./pages/Typography"
import Layout from "./pages/Layout"
import LayoutLogos from "./pages/LayoutLogos"
import LayoutIcons from "./pages/LayoutIcons"
import LayoutColors from "./pages/LayoutColors"
import LayoutMetadata from "./pages/LayoutMetadata"
import LayoutNavigation from "./pages/LayoutNavigation"
import LayoutPanel from "./pages/LayoutPanel"
import Links from "./pages/Links"
import Icons from "./pages/Icons"
import Containers from "./pages/Containers"
import Utilities from "./pages/Utilities"
import Conversations from "./pages/Conversations"
import Pagination from "./pages/Pagination"
import Integrations from "./pages/Integrations"
import Devise from "./pages/Devise"
import Pagy from "./pages/Pagy"

const navigation = [
  { label: "Welcome", path: "/" },
  {
    label: "Integrations",
    path: "/integrations",
    children: [
      { label: "Devise", path: "/integrations/devise" },
      { label: "Pagy", path: "/integrations/pagy" },
    ],
  },
  {
    label: "Layout",
    path: "/layout",
    children: [
      { label: "Logos", path: "/layout/logos" },
      { label: "Icons", path: "/layout/icons" },
      { label: "Colors", path: "/layout/colors" },
      { label: "Metadata", path: "/layout/metadata" },
      { label: "Navigation", path: "/layout/navigation" },
      { label: "Panel", path: "/layout/panel" },
    ],
  },
  { label: "Utilities", path: "/utilities" },
  { label: "Typography", path: "/typography" },
  { label: "Containers", path: "/containers" },
  { label: "Surfaces", path: "/surfaces" },
  { label: "Buttons", path: "/buttons" },
  { label: "Links", path: "/links" },
  { label: "Icons", path: "/icons" },
  { label: "Badges", path: "/badges" },
  { label: "Notices", path: "/notices" },
  {
    label: "Forms",
    path: "/forms",
    children: [
      { label: "Errors", path: "/forms/errors" },
    ],
  },
  { label: "Tables", path: "/tables" },
  { label: "Tabs", path: "/tabs" },
  { label: "Conversations", path: "/conversations" },
  { label: "Pagination", path: "/pagination" },
]

export default function App() {
  return (
    <AppShell navigation={navigation}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/buttons" element={<Buttons />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/surfaces" element={<Surfaces />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/forms/errors" element={<FormErrors />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/tabs" element={<Tabs />} />
        <Route path="/typography" element={<Typography />} />
        <Route path="/layout" element={<Layout />} />
        <Route path="/layout/logos" element={<LayoutLogos />} />
        <Route path="/layout/icons" element={<LayoutIcons />} />
        <Route path="/layout/colors" element={<LayoutColors />} />
        <Route path="/layout/metadata" element={<LayoutMetadata />} />
        <Route path="/layout/navigation" element={<LayoutNavigation />} />
        <Route path="/layout/panel" element={<LayoutPanel />} />
        <Route path="/links" element={<Links />} />
        <Route path="/icons" element={<Icons />} />
        <Route path="/containers" element={<Containers />} />
        <Route path="/utilities" element={<Utilities />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/pagination" element={<Pagination />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/integrations/devise" element={<Devise />} />
        <Route path="/integrations/pagy" element={<Pagy />} />
      </Routes>
    </AppShell>
  )
}
