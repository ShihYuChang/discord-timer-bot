# Get the directory containing the script
script_dir="$(dirname "${BASH_SOURCE[0]}")"

# Change to the script's directory
cd "$script_dir"
chmod +x install.sh
docker build -t discord-work-timer . &&
docker run -e "TZ=Asia/Taipei" discord-work-timer