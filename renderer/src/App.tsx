import { Canvas } from './scene/Canvas';
import { useIpcBridge } from './ipc/bridge';
import { InputBar } from './ui/InputBar';
import { ActivityPanel } from './ui/ActivityPanel';
import { Toaster } from './ui/Toast';
import { Hotkeys } from './ui/Hotkeys';
import { StatusBar } from './ui/StatusBar';
import { HelpHint } from './ui/HelpHint';
import { Inspector } from './ui/Inspector';
import { SearchModal } from './ui/SearchModal';
import { Minimap } from './ui/Minimap';
import { FilterChips } from './ui/FilterChips';
import { BookmarksBar } from './ui/BookmarksBar';
import { DropPaste } from './ui/DropPaste';
import { BoardSwitcher } from './ui/BoardSwitcher';
import { NotificationCenter } from './ui/NotificationCenter';
import { Onboarding } from './ui/Onboarding';
import { UndoBar } from './ui/UndoBar';
import { VoiceController } from './ui/Voice';
import { LayoutMenu } from './ui/LayoutMenu';
import { ModelPicker } from './ui/ModelPicker';
import { AgentActivityHud } from './ui/AgentActivityHud';
import { LayoutActivityPanel } from './ui/LayoutActivityPanel';
import { MarkingMenu } from './ui/MarkingMenu';

export function App() {
  useIpcBridge();
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas />
      <BoardSwitcher />
      <LayoutMenu />
      <ModelPicker />
      <StatusBar />
      <FilterChips />
      <Minimap />
      <BookmarksBar />
      <UndoBar />
      <NotificationCenter />
      <ActivityPanel />
      <LayoutActivityPanel />
      <AgentActivityHud />
      <Toaster />
      <InputBar />
      <VoiceController />
      <HelpHint />
      <Inspector />
      <SearchModal />
      <DropPaste />
      <Onboarding />
      <MarkingMenu />
      <Hotkeys />
    </div>
  );
}
