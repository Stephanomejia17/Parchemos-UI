"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextField, type TextFieldProps } from "./TextField";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "trailing"> & {
  /** Estado del ojo controlado desde fuera, para sincronizar dos campos. */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
};

/** Campo de contraseña con boton para mostrar/ocultar. */
export function PasswordField({ visible, onVisibleChange, ...props }: PasswordFieldProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const shown = visible ?? internalVisible;

  const toggle = () => {
    const next = !shown;
    setInternalVisible(next);
    onVisibleChange?.(next);
  };

  return (
    <TextField
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={toggle}
          aria-label={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}
