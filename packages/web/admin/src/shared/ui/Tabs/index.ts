import { TabsRoot } from './TabsRoot'
import { TabsList } from './TabsList'
import { TabsTab } from './TabsTab'
import { TabsPanel } from './TabsPanel'

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
})
