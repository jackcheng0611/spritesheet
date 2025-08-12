import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class VideoSpriteGenerator {
    constructor() {
        this.ffmpeg = new FFmpeg();
        this.isLoaded = false;
        this.currentVideoFile = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadFFmpeg();
    }

    async loadFFmpeg() {
        try {
            console.log('開始載入 FFmpeg...');
            this.updateLoadingStatus('正在載入 FFmpeg...');
            
            // 檢查瀏覽器支援
            if (typeof WebAssembly === 'undefined') {
                throw new Error('您的瀏覽器不支援 WebAssembly，請使用 Chrome 68+ 或 Firefox 52+');
            }
            
            // SharedArrayBuffer 不是必需的，使用單線程模式
            const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
            if (!hasSharedArrayBuffer) {
                console.warn('SharedArrayBuffer 不可用，將使用單線程模式（效能較慢但仍可用）');
                this.updateLoadingStatus('正在載入 FFmpeg（單線程模式）...');
            }
            
            // 設定進度監聽
            this.ffmpeg.on('log', ({ message }) => {
                console.log('FFmpeg:', message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                console.log(`FFmpeg 進度: ${percent}%`);
            });
            
            // 使用單線程版本的 FFmpeg 核心
            const cdnSources = [
                {
                    name: 'unpkg.com (單線程)',
                    baseURL: 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd'
                },
                {
                    name: 'jsdelivr.net (單線程)', 
                    baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/umd'
                },
                {
                    name: 'unpkg.com (多線程)',
                    baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
                }
            ];
            
            let lastError = null;
            let loadSuccess = false;
            
            for (const source of cdnSources) {
                if (loadSuccess) break;
                
                // 如果沒有 SharedArrayBuffer，跳過多線程版本
                if (!hasSharedArrayBuffer && source.name.includes('多線程')) {
                    console.log(`跳過 ${source.name}，因為 SharedArrayBuffer 不可用`);
                    continue;
                }
                
                try {
                    console.log(`嘗試從 ${source.name} 載入...`);
                    this.updateLoadingStatus(`正在從 ${source.name} 下載檔案...`);
                    
                    // 預先檢查檔案可用性
                    const coreCheck = await fetch(`${source.baseURL}/ffmpeg-core.js`, { method: 'HEAD' });
                    if (!coreCheck.ok) {
                        throw new Error(`核心檔案不可用: ${coreCheck.status}`);
                    }
                    
                    const wasmCheck = await fetch(`${source.baseURL}/ffmpeg-core.wasm`, { method: 'HEAD' });
                    if (!wasmCheck.ok) {
                        throw new Error(`WASM 檔案不可用: ${wasmCheck.status}`);
                    }
                    
                    // 載入檔案
                    this.updateLoadingStatus('正在載入核心檔案...');
                    const coreURL = await this.loadWithTimeout(
                        toBlobURL(`${source.baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        45000
                    );
                    
                    this.updateLoadingStatus('正在載入 WebAssembly 模組...');
                    const wasmURL = await this.loadWithTimeout(
                        toBlobURL(`${source.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                        90000
                    );

                    this.updateLoadingStatus('正在初始化 FFmpeg...');
                    
                    // 載入配置
                    const loadConfig = {
                        coreURL,
                        wasmURL,
                    };
                    
                    // 如果使用單線程版本，不需要額外設定
                    // 如果是多線程版本但沒有 SharedArrayBuffer，強制單線程
                    if (!hasSharedArrayBuffer && !source.name.includes('單線程')) {
                        loadConfig.classWorkerURL = null; // 禁用 worker
                    }
                    
                    await this.ffmpeg.load(loadConfig);

                    loadSuccess = true;
                    console.log(`✅ 成功從 ${source.name} 載入 FFmpeg`);
                    
                } catch (error) {
                    console.warn(`從 ${source.name} 載入失敗:`, error);
                    lastError = error;
                    
                    // 如果不是最後一個來源，繼續嘗試
                    if (source !== cdnSources[cdnSources.length - 1]) {
                        continue;
                    }
                }
            }
            
            if (!loadSuccess) {
                throw lastError || new Error('所有載入來源都失敗了');
            }

            this.isLoaded = true;
            const modeText = hasSharedArrayBuffer ? '多線程模式' : '單線程模式';
            console.log(`FFmpeg 載入完成（${modeText}）`);
            this.updateLoadingStatus(`FFmpeg 載入完成！（${modeText}）`);
            
            setTimeout(() => {
                this.hideLoadingStatus();
            }, 2000);
            
        } catch (error) {
            console.error('FFmpeg 載入失敗:', error);
            
            let errorMessage = `FFmpeg 載入失敗: ${error.message}\n\n`;
            
            // 根據錯誤類型提供具體建議
            if (error.message.includes('WebAssembly')) {
                errorMessage += '請使用支援 WebAssembly 的現代瀏覽器：\n• Chrome 57+\n• Firefox 52+\n• Safari 11+';
            } else if (error.message.includes('timeout') || error.message.includes('載入超時')) {
                errorMessage += '載入超時，可能的解決方案：\n• 檢查網路連線速度\n• 重新整理頁面重試\n• 嘗試使用行動網路';
            } else if (error.message.includes('fetch') || error.message.includes('不可用')) {
                errorMessage += '網路連線問題，請嘗試：\n• 檢查防火牆設定\n• 關閉廣告攔截器\n• 使用 VPN 或更換網路';
            } else {
                errorMessage += '請嘗試：\n• 重新整理頁面\n• 使用 Chrome 瀏覽器\n• 檢查網路連線\n• 或使用簡單版本 (simple.html)';
            }
            
            this.showError(errorMessage);
            this.hideLoadingStatus();
        }
    }
    
    // 載入超時輔助函數
    async loadWithTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`載入超時 (${timeout}ms)`)), timeout)
            )
        ]);
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.querySelector('.upload-area');
        const generateBtn = document.getElementById('generateBtn');

        // 檔案選擇
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // 拖拽上傳
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // 生成按鈕
        generateBtn.addEventListener('click', () => {
            this.generateSprite();
        });

        // FFmpeg 日誌監聽
        this.ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg:', message);
        });

        // FFmpeg 進度監聽
        this.ffmpeg.on('progress', ({ progress }) => {
            this.updateProgress(Math.round(progress * 100));
        });
    }

    handleFileSelect(file) {
        // 檢查檔案類型
        if (!file.type.startsWith('video/')) {
            this.showError('請選擇影片檔案');
            return;
        }

        this.currentVideoFile = file;
        this.showVideoPreview(file);
        
        document.getElementById('generateBtn').disabled = false;
        this.hideError();
        
        console.log('已選擇影片:', file.name);
    }

    showVideoPreview(file) {
        const videoPreview = document.getElementById('videoPreview');
        const previewVideo = document.getElementById('previewVideo');
        
        const url = URL.createObjectURL(file);
        previewVideo.src = url;
        videoPreview.style.display = 'block';
    }

    async generateSprite() {
        if (!this.isLoaded) {
            this.showError('FFmpeg 尚未載入完成。\n\n請嘗試：\n1. 等待載入完成（首次使用需要較長時間）\n2. 重新整理頁面\n3. 檢查網路連線');
            
            // 提供重新載入選項
            if (!this.loadingRetried) {
                this.loadingRetried = true;
                this.showRetryButton();
            }
            return;
        }

        if (!this.currentVideoFile) {
            this.showError('請先選擇影片檔案');
            return;
        }

        try {
            this.showProgress();
            document.getElementById('generateBtn').disabled = true;

            const columns = parseInt(document.getElementById('columns').value);
            const rows = parseInt(document.getElementById('rows').value);

            await this.processVideo(this.currentVideoFile, columns, rows);

        } catch (error) {
            console.error('生成雪碧圖失敗:', error);
            this.showError('生成雪碧圖失敗: ' + error.message);
        } finally {
            this.hideProgress();
            document.getElementById('generateBtn').disabled = false;
        }
    }

    async processVideo(videoFile, columns, rows) {
        const inputName = 'input.' + this.getFileExtension(videoFile.name);
        const outputPngName = 'sprite.png';
        const outputWebpName = 'sprite.webp';

        // 寫入影片檔案到 FFmpeg 記憶體
        await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

        // 第一步：生成雪碧圖 (PNG)
        this.updateProgressText('正在分析影片...');
        
        const totalFrames = columns * rows;
        
        // 使用 FFmpeg 生成雪碧圖
        await this.ffmpeg.exec([
            '-i', inputName,
            '-vf', `select=not(mod(n\\,floor(n_frames/${totalFrames}))),scale=320:240,tile=${columns}x${rows}`,
            '-frames:v', '1',
            '-y',
            outputPngName
        ]);

        this.updateProgressText('正在轉換為 WebP 格式...');
        
        // 第二步：將 PNG 轉換為 WebP
        await this.ffmpeg.exec([
            '-i', outputPngName,
            '-quality', '80',
            '-y',
            outputWebpName
        ]);

        // 讀取生成的 WebP 檔案
        const data = await this.ffmpeg.readFile(outputWebpName);
        
        // 建立下載連結
        const blob = new Blob([data.buffer], { type: 'image/webp' });
        const url = URL.createObjectURL(blob);

        this.showResult(url);

        // 清理 FFmpeg 記憶體
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputPngName);
        await this.ffmpeg.deleteFile(outputWebpName);
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    showResult(imageUrl) {
        const resultContainer = document.getElementById('resultContainer');
        const resultImage = document.getElementById('resultImage');
        const downloadBtn = document.getElementById('downloadBtn');

        resultImage.src = imageUrl;
        downloadBtn.href = imageUrl;
        
        resultContainer.style.display = 'block';
        
        // 滾動到結果區域
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    showProgress() {
        document.getElementById('progressContainer').style.display = 'block';
        this.updateProgress(0);
    }

    hideProgress() {
        document.getElementById('progressContainer').style.display = 'none';
    }

    updateProgress(percent) {
        document.getElementById('progressFill').style.width = percent + '%';
    }

    updateProgressText(text) {
        document.getElementById('progressText').textContent = text;
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.innerHTML = message.replace(/\n/g, '<br>');
        errorElement.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
        this.hideRetryButton();
    }

    showRetryButton() {
        const errorElement = document.getElementById('errorMessage');
        if (!document.getElementById('retryBtn')) {
            const retryBtn = document.createElement('button');
            retryBtn.id = 'retryBtn';
            retryBtn.textContent = '重新載入 FFmpeg';
            retryBtn.style.cssText = `
                margin-top: 10px;
                padding: 8px 16px;
                background-color: #667eea;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            `;
            retryBtn.onclick = () => {
                this.hideError();
                this.isLoaded = false;
                this.loadFFmpeg();
            };
            errorElement.appendChild(retryBtn);
        }
    }

    hideRetryButton() {
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.remove();
        }
    }

    updateLoadingStatus(text) {
        // 更新上傳區域顯示載入狀態
        const uploadArea = document.querySelector('.upload-area');
        const uploadText = uploadArea.querySelector('.upload-text');
        const uploadHint = uploadArea.querySelector('.upload-hint');
        
        uploadText.textContent = text;
        uploadHint.textContent = '請稍候...';
        uploadArea.classList.add('loading');
        
        // 禁用點擊功能
        uploadArea.onclick = null;
    }

    hideLoadingStatus() {
        // 恢復上傳區域原始狀態
        const uploadArea = document.querySelector('.upload-area');
        const uploadText = uploadArea.querySelector('.upload-text');
        const uploadHint = uploadArea.querySelector('.upload-hint');
        
        uploadText.textContent = '點擊或拖拽影片檔案到這裡';
        uploadHint.textContent = '支援 MP4, AVI, MOV, MKV 等格式';
        uploadArea.classList.remove('loading');
        
        // 恢復點擊功能
        uploadArea.onclick = () => document.getElementById('fileInput').click();
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    new VideoSpriteGenerator();
});
