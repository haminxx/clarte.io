import { ClarteVoiceApp } from "./components/ClarteVoiceApp";
import { SimpleTest } from "./components/SimpleTest";

// Set to true to test if React is working
const USE_TEST_COMPONENT = false;

function App() {
  if (USE_TEST_COMPONENT) {
    return <SimpleTest />;
  }
  
  return <ClarteVoiceApp />;
}

export default App;
