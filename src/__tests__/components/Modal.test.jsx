import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../components/UI/Modal';

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children) => children
  };
});

describe('Modal', () => {
  let originalBodyStyle;

  beforeEach(() => {
    originalBodyStyle = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyStyle;
  });

  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should render with title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    );
    
    const backdrop = screen.getByRole('dialog').parentElement;
    fireEvent.click(backdrop);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on backdrop click when closeOnBackdrop is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={false}>
        <div>Modal content</div>
      </Modal>
    );
    
    const backdrop = screen.getByRole('dialog').parentElement;
    fireEvent.click(backdrop);
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should call onClose when escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on escape when closeOnEscape is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should apply different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');

    rerender(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');

    rerender(
      <Modal isOpen={true} onClose={() => {}} size="full">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-full');
  });

  it('should apply custom className', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} className="custom-modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
  });

  it('should prevent body scroll when open', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Accessible Modal">
        <div>Content</div>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});

describe('Modal subcomponents', () => {
  it('should render ModalHeader', () => {
    render(<ModalHeader>Header content</ModalHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should render ModalBody', () => {
    render(<ModalBody>Body content</ModalBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('should render ModalFooter', () => {
    render(<ModalFooter>Footer content</ModalFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should apply custom className to subcomponents', () => {
    render(
      <div>
        <ModalHeader className="custom-header">Header</ModalHeader>
        <ModalBody className="custom-body">Body</ModalBody>
        <ModalFooter className="custom-footer">Footer</ModalFooter>
      </div>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});