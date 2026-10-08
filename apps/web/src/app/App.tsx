import { Route, Routes } from 'react-router-dom';
import { FoundationPage } from '../pages/FoundationPage';

/**
 * Phase 0 web shell only.
 * No marketplace / listing / search product UI.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />
    </Routes>
  );
}
