import { createContext, useState, useContext, useCallback } from 'react';
import Modal from './Modal';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    onConfirm: null,
    variant: 'danger'
  });

  const showModal = useCallback(({ title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', onConfirm, variant = 'danger' }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      variant
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  }, [modalState, closeModal]);

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmLabel={modalState.confirmLabel}
        cancelLabel={modalState.cancelLabel}
        variant={modalState.variant}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
