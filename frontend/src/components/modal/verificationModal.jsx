"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";

export default function VerificationModal({ isOpen, onClose }) {
  const panelRef = useRef(null);

  // Close on outside click (handled by headlessui by default)
  // Auto-close modal after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              ref={panelRef}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            >
              <Dialog.Title className="text-lg font-bold text-center mb-2">
                Verify Your Email
              </Dialog.Title>
              <p className="text-center mb-4 text-gray-700">
                A verification link has been sent to your email.
                <br />
                Please check your inbox and click the link to complete
                registration.
              </p>
              <div className="flex justify-center">
                <a
                  href="https://mail.google.com/mail/u/0/#inbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Go to Inbox
                </a>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
