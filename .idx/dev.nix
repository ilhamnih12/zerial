{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
  ];
  idx.extensions = [
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "ms-vscode.vscode-typescript-next"
  ];
  idx.preview = {
    command = ["npm" "run" "dev"];
    port = 5173;
  };
}