// Import all styles to create dependencies for caching demonstration
import './styles/utils/mixins.css';
import './styles/theme/colors.css';
import './styles/theme/typography.css';
import './styles/components/button.css';
import './styles/components/card.css';
import './styles/components/input.css';
import './styles/layout/container.css';
import './styles/layout/grid.css';

// Export a test object to make this a valid module
export const styles = {
  loaded: true,
  timestamp: Date.now(),
};
