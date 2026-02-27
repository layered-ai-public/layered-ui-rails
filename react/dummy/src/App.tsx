import { Routes, Route } from "react-router-dom"
import { AppShell } from "@layered-ui/components/layout"

import Welcome from "./pages/Welcome"
import Buttons from "./pages/Buttons"
import Badges from "./pages/Badges"
import Notices from "./pages/Notices"
import Surfaces from "./pages/Surfaces"
import Forms from "./pages/Forms"
import Tables from "./pages/Tables"
import Tabs from "./pages/Tabs"
import Typography from "./pages/Typography"
import Layout from "./pages/Layout"

const navigation = [
  { label: "Welcome", path: "/" },
  {
    label: "Layout",
    path: "/layout",
    children: [
      { label: "Logos", path: "/layout/logos" },
      { label: "Icons", path: "/layout/icons" },
      { label: "Colors", path: "/layout/colors" },
    ],
  },
  { label: "Typography", path: "/typography" },
  { label: "Surfaces", path: "/surfaces" },
  { label: "Buttons", path: "/buttons" },
  { label: "Badges", path: "/badges" },
  { label: "Notices", path: "/notices" },
  { label: "Forms", path: "/forms" },
  { label: "Tables", path: "/tables" },
  { label: "Tabs", path: "/tabs" },
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
        <Route path="/tables" element={<Tables />} />
        <Route path="/tabs" element={<Tabs />} />
        <Route path="/typography" element={<Typography />} />
        <Route path="/layout" element={<Layout />} />
      </Routes>
    </AppShell>
  )
}
