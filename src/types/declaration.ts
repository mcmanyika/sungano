export interface Declaration {
  headline: string;
  message: string;
  body: string;
  updatedAt: Date | null;
}

export interface DeclarationInput {
  headline: string;
  message: string;
  body: string;
}

export const DEFAULT_DECLARATION: DeclarationInput = {
  headline: "Restore the Constitution:",
  message:
    "Justice in the Courts.\nSovereignty with the People.\nPeacefully. Lawfully. Together.",
  body: "",
};

export function formatDeclarationMessage(message: string): string[] {
  return message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getDeclarationModalContent(declaration: Declaration): string {
  return declaration.body.trim() || declaration.message.trim();
}
