#!/bin/bash

echo "🚀 FFmpeg.wasm 雪碧圖生成器啟動腳本"
echo "=================================="
echo ""

# 檢查作業系統
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "檢測到作業系統: $MACHINE"
echo ""

# 啟動開發伺服器
echo "📡 啟動開發伺服器..."
npm run dev &
SERVER_PID=$!

# 等待伺服器啟動
sleep 3

echo ""
echo "🌐 應用程式網址："
echo "主程式: http://localhost:5173/"
echo "簡單版: http://localhost:5173/simple.html"
echo "診斷工具: http://localhost:5173/sab-diagnostic.html"
echo ""

# 根據作業系統啟動瀏覽器
echo "🚀 啟動瀏覽器..."

if [ "$MACHINE" = "Mac" ]; then
    echo "在 macOS 上啟動 Chrome（支援 SharedArrayBuffer）..."
    
    # 嘗試啟動 Chrome 並禁用 web security（僅用於開發）
    if command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &> /dev/null; then
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
            --user-data-dir="/tmp/chrome-dev-session" \
            --disable-web-security \
            --disable-features=VizDisplayCompositor \
            --enable-features=SharedArrayBuffer \
            "http://localhost:5173/" &
        echo "✅ Chrome 已啟動（開發模式）"
    else
        echo "⚠️ 找不到 Chrome，嘗試預設瀏覽器..."
        open "http://localhost:5173/"
    fi
    
elif [ "$MACHINE" = "Linux" ]; then
    echo "在 Linux 上啟動瀏覽器..."
    
    if command -v google-chrome &> /dev/null; then
        google-chrome \
            --user-data-dir="/tmp/chrome-dev-session" \
            --disable-web-security \
            --enable-features=SharedArrayBuffer \
            "http://localhost:5173/" &
        echo "✅ Chrome 已啟動（開發模式）"
    elif command -v firefox &> /dev/null; then
        firefox "http://localhost:5173/" &
        echo "✅ Firefox 已啟動"
    else
        echo "⚠️ 請手動開啟瀏覽器並訪問 http://localhost:5173/"
    fi
    
else
    echo "⚠️ 請手動開啟瀏覽器並訪問 http://localhost:5173/"
fi

echo ""
echo "💡 提示："
echo "• 如果 SharedArrayBuffer 不可用，請嘗試使用簡單版本"
echo "• 簡單版本：http://localhost:5173/simple.html"
echo "• 按 Ctrl+C 停止伺服器"
echo ""

# 等待用戶中斷
wait $SERVER_PID
