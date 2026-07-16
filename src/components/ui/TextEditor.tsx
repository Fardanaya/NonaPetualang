"use client";

import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
// import "@/components/ui/TextEditor/style.css";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const TextEditor = ({
  value,
  height = 480,
  minHeight = 200,
  maxHeight = 1080,
  fillHeight = false,
  width = 1920,
  minWidth = 0,
  maxWidth = 1920,
  fillWidth = true,
  resizableHeight = true,
  resizableWidth = false,
  readonly = false,
  toolbarSticky = false,
  onValueChange,
}: {
  value: string;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  fillHeight?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  fillWidth?: boolean;
  resizableHeight?: boolean;
  resizableWidth?: boolean;
  readonly?: boolean;
  toolbarSticky?: boolean;
  onValueChange: (value: string) => void;
}) => {
  const { theme } = useTheme();
  const editor = useRef<any>(null);
  const cursorPositionRef = useRef<Range | null>(null);

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      cursorPositionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreCursorPosition = () => {
    if (cursorPositionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(cursorPositionRef.current);
      }
    }
  };

  const config = useMemo(() => {
    const baseConfig: Record<string, any> = {
      theme: theme === "dark" ? "dark" : "default",
      placeholder: "",
      toolbarSticky,
      allowResizeY: resizableHeight,
      allowResizeX: resizableWidth,
      uploader: {
        insertImageAsBase64URI: true,
      },
      toolbarAdaptive: false,
      defaultFontSizePoints: "pt",
      buttons: [
        "undo",
        "redo",
        "find",
        "|",
        "bold",
        "underline",
        "italic",
        "strikethrough",
        "eraser",
        "|",
        "superscript",
        "subscript",
        "|",
        "align",
        "lineHeight",
        "|",
        "ul",
        "ol",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "|",
        "cut",
        "copy",
        "paste",
        "|",
        "image",
        "table",
        "hr",
        "symbols",
        "|",
        "fullsize",
        "selectall",
      ],
      createAttributes: {
        td: { style: "border: 1px solid #ddd;" },
      },
      cleanHTML: {
        replaceNBSP: false,
        fillEmptyParagraph: false,
      },
      events: {
        click: saveCursorPosition,
        keyup: saveCursorPosition,
        focus: restoreCursorPosition,
      },
      disablePlugins: "add-new-line,powered-by-jodit",
    };

    // Conditionally add height/width constraints based on fillHeight and fillWidth
    if (!fillHeight) {
      baseConfig.height = height;
      baseConfig.minHeight = minHeight;
      baseConfig.maxHeight = maxHeight;
    }

    if (!fillWidth) {
      baseConfig.width = width;
      baseConfig.minWidth = minWidth;
      baseConfig.maxWidth = maxWidth;
    }

    return baseConfig;
  }, [
    theme,
    readonly,
    resizableHeight,
    resizableWidth,
    fillHeight,
    fillWidth,
    height,
    minHeight,
    maxHeight,
    width,
    minWidth,
    maxWidth,
  ]);

  return (
    <div className="w-full">
      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        onBlur={(newContent: string) => {
          onValueChange(newContent);
        }}
      />
    </div>
  );
};

export default TextEditor;
