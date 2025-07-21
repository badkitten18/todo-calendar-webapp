import { describe, it, expect } from 'vitest';
import * as UIComponents from '../../../components/UI';

describe('UI Components Index', () => {
  it('exports Button component', () => {
    expect(UIComponents.Button).toBeDefined();
  });

  it('exports Modal component and its subcomponents', () => {
    expect(UIComponents.Modal).toBeDefined();
    expect(UIComponents.ModalHeader).toBeDefined();
    expect(UIComponents.ModalBody).toBeDefined();
    expect(UIComponents.ModalFooter).toBeDefined();
  });

  it('exports Input component and Textarea', () => {
    expect(UIComponents.Input).toBeDefined();
    expect(UIComponents.Textarea).toBeDefined();
  });

  it('exports FormError component', () => {
    expect(UIComponents.FormError).toBeDefined();
  });

  it('exports ErrorNotification component', () => {
    expect(UIComponents.ErrorNotification).toBeDefined();
  });
});