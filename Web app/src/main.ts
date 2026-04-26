/// <reference types="vite/client" />
import { jsPDF } from "jspdf";
import { 
    auth, 
    db, 
    storage,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    googleProvider,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    orderBy,
    limit,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from './firebase';
import { stagesData, StageData } from './stagesData';

// --- Seed Data Function ---
(window as any).seedStages = async () => {
    console.log("Starting to seed stages...");
    try {
        for (const stage of stagesData) {
            await setDoc(doc(collection(db, "stages"), `stage${stage.stage}`), stage);
            console.log(`Uploaded stage ${stage.stage}`);
        }
        console.log("All stages seeded successfully!");
        alert("All stages seeded successfully!");
    } catch (error) {
        console.error("Error seeding stages:", error);
        alert("Error seeding stages. Check console.");
    }
};

// --- UI Elements ---
const authOverlay = document.getElementById('auth-overlay');
const loginForm = document.getElementById('login-form');
const googleForm = document.getElementById('google-form');
const signupForm = document.getElementById('signup-form');
const tabLogin = document.getElementById('tab-login');
const tabGoogle = document.getElementById('tab-google');
const tabSignup = document.getElementById('tab-signup');
const linkToSignup = document.getElementById('link-to-signup');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const userNameDisplay = document.getElementById('user-name');
const loadingOverlay = document.getElementById('loading-overlay');
const toastContainer = document.getElementById('toast-container');
const btnLogout = document.getElementById('btn-logout');
const greetingText = document.getElementById('greeting-text');
const homeNotificationBanner = document.getElementById('home-notification-banner') as HTMLElement;

let notificationsUnsubscribe: any = null;

// Profile Elements
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileAvatar = document.getElementById('profile-avatar') as HTMLImageElement;
const btnChangeAvatar = document.getElementById('btn-change-avatar');
const avatarInput = document.getElementById('avatar-input') as HTMLInputElement;
const profileAgeBadge = document.getElementById('profile-age-badge');
const subscriptionStatus = document.getElementById('subscription-status');
const totalReflectionsCount = document.getElementById('total-reflections-count');
const btnExportData = document.getElementById('btn-export-data');
const btnUpgradeFull = document.getElementById('btn-upgrade-full');
const btnGoPremium = document.getElementById('btn-go-premium');
const btnConnectMentor = document.getElementById('btn-connect-mentor');
const mentorStatus = document.getElementById('mentor-status');
const profileTimeline = document.getElementById('profile-timeline');
const profileDarkModeToggle = document.getElementById('profile-dark-mode-toggle') as HTMLInputElement;
const btnProfileLogout = document.getElementById('btn-profile-logout');

// Journal Elements
const journalDate = document.getElementById('journal-date');
const moodBtns = document.querySelectorAll('.mood-btn');
const journalSituation = document.getElementById('journal-situation') as HTMLTextAreaElement;
const journalNotes = document.getElementById('journal-notes') as HTMLTextAreaElement;
const situationCounter = document.getElementById('situation-counter');
const notesCounter = document.getElementById('notes-counter');
const journalAnalyzed = document.getElementById('journal-analyzed') as HTMLInputElement;
const toggleLabel = document.getElementById('toggle-label');
const btnSaveJournal = document.getElementById('btn-save-journal');

// Recording Elements
const btnStartRecord = document.getElementById('btn-start-record') as HTMLButtonElement;
const recordingControls = document.getElementById('recording-controls');
const recordingTimer = document.getElementById('recording-timer');
const btnStopRecord = document.getElementById('btn-stop-record') as HTMLButtonElement;
const audioPreviewContainer = document.getElementById('audio-preview-container');
const audioPlayback = document.getElementById('audio-playback') as HTMLAudioElement;
const btnDeleteAudio = document.getElementById('btn-delete-audio') as HTMLButtonElement;
const keepAudioCheckbox = document.getElementById('keep-audio-checkbox') as HTMLInputElement;
const btnTranscribeAudio = document.getElementById('btn-transcribe-audio') as HTMLButtonElement;
const uploadProgressContainer = document.getElementById('upload-progress-container');
const uploadProgressText = document.getElementById('upload-progress-text');
const uploadProgressBar = document.getElementById('upload-progress-bar');

// Tools Elements
const toolsGrid = document.getElementById('tools-grid');
const toolSearch = document.getElementById('tool-search') as HTMLInputElement;
const toolFilter = document.getElementById('tool-filter') as HTMLSelectElement;
const toolModal = document.getElementById('tool-modal');
const modalToolName = document.getElementById('modal-tool-name');
const modalToolCategory = document.getElementById('modal-tool-category');
const modalToolInstructions = document.getElementById('modal-tool-instructions');
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-progress');
const btnPauseTimer = document.getElementById('btn-pause-timer');
const btnCompletePractice = document.getElementById('btn-complete-practice');
const closeToolModal = document.getElementById('close-tool-modal');

// Stage Detail Elements
const stageHeaderTitle = document.getElementById('stage-header-title');
const btnContinueJourney = document.getElementById('btn-continue-journey') as HTMLButtonElement;

// Stages Carousel Elements
const stagesCarousel = document.getElementById('stages-carousel');
const btnPrevStage = document.getElementById('prev-stage');
const btnNextStage = document.getElementById('next-stage');
const carouselIndicators = document.getElementById('carousel-indicators');
const carouselOverallProgress = document.getElementById('carousel-overall-progress');

// --- State ---
let currentUser: any = null;
let siChart: any = null;
let profileSiChart: any = null;
let selectedMood = '';
let userStage = 1;
let userProgress: any = null;
let timerInterval: any = null;
let timeLeft = 300; // 5 minutes in seconds
let isTimerPaused = false;
let currentTool: Tool | null = null;
let currentViewStageId: number | null = null;
let currentCarouselIndex = 0;

// Recording State
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null;
let recordingInterval: any = null;
let recordingSeconds = 0;
let audioDuration = 0;
let recognition: any = null;
let transcribedText = '';

interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    stage: number;
    instructions: string;
    icon: string;
    duration: number; // in minutes
}

const tools: Tool[] = [
    { id: '1', name: 'Spiritual Work', description: 'Detached daily actions for calm', category: 'Action', stage: 1, duration: 5, icon: '⚡', instructions: 'Perform your next task without thinking about the result. Focus entirely on the action itself, not what you gain from it.' },
    { id: '2', name: 'Discipline', description: 'Building unwavering routine', category: 'Will', stage: 1, duration: 10, icon: '🛡️', instructions: 'Sit perfectly still for the duration of the timer. Do not scratch, shift, or move a single muscle. Observe the urge to move without acting on it.' },
    { id: '3', name: 'Mindfulness', description: 'Staying present in the moment', category: 'Awareness', stage: 1, duration: 5, icon: '👁️', instructions: 'Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.' },
    { id: '4', name: 'Gratitude', description: 'Focusing on the positive', category: 'Emotion', stage: 1, duration: 5, icon: '🙏', instructions: 'List 10 things you are genuinely grateful for today. For each one, spend 30 seconds feeling the warmth of that gratitude in your chest.' },
    { id: '5', name: 'Self-Inquiry', description: 'Questioning the nature of self', category: 'Wisdom', stage: 2, duration: 10, icon: '❓', instructions: 'Close your eyes and ask "Who am I?". When a thought arises, ask "To whom does this thought arise?". Follow the trail back to the source.' },
    { id: '6', name: 'Meditation', description: 'Quieting the mind', category: 'Awareness', stage: 2, duration: 10, icon: '🧘', instructions: 'Focus on the sensation of breath at the tip of your nose. When the mind wanders, gently bring it back without judgment.' },
    { id: '7', name: 'Breathwork', category: 'Body', stage: 1, duration: 5, icon: '🌬️', description: 'Using breath for emotional regulation', instructions: 'Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat this box breathing pattern.' },
    { id: '8', name: 'Service', category: 'Action', stage: 2, duration: 15, icon: '🤝', description: 'Helping others without expectation', instructions: 'Think of one small thing you can do for someone else today that requires effort but offers you no personal gain.' },
    { id: '9', name: 'Study', category: 'Wisdom', stage: 1, duration: 10, icon: '📖', description: 'Reading sacred or uplifting texts', instructions: 'Read a single paragraph of a wisdom text. Contemplate how its core message applies to your life right now.' },
    { id: '10', name: 'Silence', category: 'Discipline', stage: 3, duration: 15, icon: '🤫', description: 'Practicing periods of no speech', instructions: 'Commit to total silence. If you must communicate, use the minimum necessary. Observe the internal chatter that arises.' },
    { id: '11', name: 'Fasting', category: 'Discipline', stage: 2, duration: 20, icon: '🍎', description: 'Disciplining the body\'s desires', instructions: 'Choose one sensory desire (like checking your phone or a specific snack) and abstain from it for the next hour.' },
    { id: '12', name: 'Journaling', category: 'Reflection', stage: 1, duration: 10, icon: '✍️', description: 'Externalizing thoughts for clarity', instructions: 'Write down the most recurring thought you had today. Analyze why it keeps appearing and what it reveals about your attachments.' },
    { id: '13', name: 'Affirmations', category: 'Will', stage: 1, duration: 5, icon: '✨', description: 'Reprogramming the subconscious', instructions: 'Repeat a chosen positive affirmation with conviction. Visualize the words sinking into your heart with every repetition.' },
    { id: '14', name: 'Visualization', category: 'Will', stage: 3, duration: 10, icon: '🌈', description: 'Seeing the desired outcome', instructions: 'Visualize yourself responding to a difficult situation with perfect calm and detachment. See the details vividly.' },
    { id: '15', name: 'Forgiveness', category: 'Emotion', stage: 2, duration: 10, icon: '🕊️', description: 'Releasing past burdens', instructions: 'Think of someone you hold a grudge against. Realize that holding the grudge only hurts you. Mentally wish them peace.' },
    { id: '16', name: 'Devotion', category: 'Spirit', stage: 3, duration: 10, icon: '❤️', description: 'Connecting to a higher power', instructions: 'Offer your day\'s efforts to a higher power or the universe. Feel a sense of surrender and trust in the process.' }
];

// --- Utility Functions ---
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const setLoading = (isLoading: boolean) => {
    if (isLoading) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
};

const showToast = (message: string, type: 'error' | 'success' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `px-6 py-4 rounded-2xl shadow-xl text-white font-semibold flex items-center gap-3 animate-slide-in pointer-events-auto ${
        type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
    }`;
    
    const icon = type === 'error' 
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};

// --- Recording Functions ---
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup MediaRecorder
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            audioDuration = recordingSeconds;
            
            // Stop all tracks to release mic
            stream.getTracks().forEach(track => track.stop());
            
            // UI Update
            recordingControls.classList.add('hidden');
            audioPreviewContainer.classList.remove('hidden');
            btnStartRecord.classList.add('hidden');
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Setup Speech Recognition (Optional)
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-IN';
            transcribedText = '';
            
            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    transcribedText += finalTranscript + ' ';
                }
            };
            
            recognition.start();
        }
        
        // UI Update
        btnStartRecord.classList.add('hidden');
        recordingControls.classList.remove('hidden');
        recordingControls.classList.add('flex');
        audioPreviewContainer.classList.add('hidden');
        
        // Timer
        recordingSeconds = 0;
        recordingTimer.textContent = `Recording ${formatTime(recordingSeconds)}`;
        recordingInterval = setInterval(() => {
            recordingSeconds++;
            recordingTimer.textContent = `Recording ${formatTime(recordingSeconds)}`;
        }, 1000);
        
    } catch (err: any) {
        console.error("Microphone error:", err);
        if (err.name === 'NotAllowedError') {
            showToast("Microphone permission denied", "error");
        } else if (err.name === 'NotFoundError') {
            showToast("No microphone found", "error");
        } else {
            showToast("Could not start recording", "error");
        }
    }
};

const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (recognition) {
        recognition.stop();
    }
    clearInterval(recordingInterval);
};

const deleteAudio = () => {
    audioBlob = null;
    audioChunks = [];
    audioDuration = 0;
    audioPlayback.src = '';
    
    audioPreviewContainer.classList.add('hidden');
    btnStartRecord.classList.remove('hidden');
    keepAudioCheckbox.checked = true;
};

const transcribeAudio = () => {
    if (transcribedText) {
        if (journalSituation.value === '') {
            journalSituation.value = transcribedText.trim();
        } else {
            journalSituation.value += '\n\nTranscription:\n' + transcribedText.trim();
        }
        const len = journalSituation.value.length;
        situationCounter.textContent = `${len} / 2000`;
        showToast("Transcription added to journal entry.");
    } else {
        showToast("No transcription available. Please speak clearly while recording.", "error");
    }
};

// --- Journal Functions ---
const handleMoodSelect = (mood: string) => {
    selectedMood = mood;
    moodBtns.forEach(btn => {
        const b = btn as HTMLElement;
        if (b.getAttribute('data-mood') === mood) {
            b.classList.add('border-primary', 'bg-primary/5');
            b.classList.remove('border-transparent', 'bg-gray-50', 'dark:bg-gray-900');
        } else {
            b.classList.remove('border-primary', 'bg-primary/5');
            b.classList.add('border-transparent', 'bg-gray-50', 'dark:bg-gray-900');
        }
    });
};

const updateWeeklyAnalyzedCount = async (uid: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    try {
        console.log(`[Query] Fetching journal entries for ${uid} since ${startOfMonth.toISOString()}`);
        const q = query(
            collection(db, `users/${uid}/journal_entries`),
            where("date", ">=", Timestamp.fromDate(startOfMonth))
        );
        
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.docs.filter(doc => doc.data().analyzed === true).length;
        
        const progressRef = doc(db, `users/${uid}/progress`, "current");
        await setDoc(progressRef, { situationsAnalyzed: count }, { merge: true });
    } catch (error: any) {
        console.error("Error updating weekly analyzed count:", error);
        if (error.message && error.message.includes('requires an index')) {
            showToast("Creating Firestore index... try again in 5 min", 'error');
            console.log("Create index here:", error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]);
        }
    }
};

const handleJournalSave = async () => {
    if (!currentUser) return;
    
    const situation = journalSituation.value.trim();
    const notes = journalNotes.value.trim();
    const analyzed = journalAnalyzed.checked;
    
    if (!selectedMood) {
        showToast("Please select a mood", 'error');
        return;
    }
    
    if (!situation && !audioBlob) {
        showToast("Please describe the situation or record audio", 'error');
        return;
    }
    
    setLoading(true);
    try {
        let audioUrl = null;
        let finalAudioDuration = null;

        if (audioBlob && keepAudioCheckbox.checked) {
            // Show progress UI
            uploadProgressContainer.classList.remove('hidden');
            
            const entryId = Date.now().toString(); // Use timestamp as a simple unique ID
            const storageRef = ref(storage, `users/${currentUser.uid}/journal_audio/${entryId}.webm`);
            const uploadTask = uploadBytesResumable(storageRef, audioBlob);

            audioUrl = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        uploadProgressBar.style.width = `${progress}%`;
                        uploadProgressText.textContent = `${Math.round(progress)}%`;
                    }, 
                    (error) => {
                        console.error("Upload failed:", error);
                        reject(error);
                    }, 
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    }
                );
            });
            finalAudioDuration = audioDuration;
            
            // Hide progress UI
            uploadProgressContainer.classList.add('hidden');
            uploadProgressBar.style.width = `0%`;
            uploadProgressText.textContent = `0%`;
        }

        const entryData: any = {
            date: Timestamp.now(),
            mood: selectedMood,
            situation: situation,
            analyzed: analyzed,
            notes: notes
        };

        if (transcribedText.trim() !== '') {
            entryData.transcribedText = transcribedText.trim();
        }

        if (audioUrl) {
            entryData.audioUrl = audioUrl;
            entryData.audioDuration = finalAudioDuration;
        }

        await addDoc(collection(db, `users/${currentUser.uid}/journal_entries`), entryData);
        
        if (analyzed) {
            await updateWeeklyAnalyzedCount(currentUser.uid);
        }
        
        showToast("Reflection saved");
        
        // Reset form
        journalSituation.value = '';
        journalNotes.value = '';
        journalAnalyzed.checked = false;
        toggleLabel.textContent = 'No';
        selectedMood = '';
        transcribedText = '';
        moodBtns.forEach(btn => btn.classList.remove('border-primary', 'bg-primary/5'));
        situationCounter.textContent = '0 / 2000';
        notesCounter.textContent = '0 / 300';
        deleteAudio(); // Reset audio state
        
        loadJournalTemplate(); // Reload template for next entry
        switchView('home');
    } catch (error: any) {
        console.error("Error saving journal:", error);
        showToast(error.message, 'error');
        uploadProgressContainer.classList.add('hidden');
    } finally {
        setLoading(false);
    }
};

// --- Tools Functions ---
const renderTools = () => {
    const searchTerm = toolSearch.value.toLowerCase();
    const filterValue = toolFilter.value;
    
    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm) || tool.description.toLowerCase().includes(searchTerm);
        const matchesFilter = filterValue === 'all' || tool.stage <= userStage;
        return matchesSearch && matchesFilter;
    });

    toolsGrid.innerHTML = filteredTools.map(tool => `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ${tool.icon}
                </div>
                <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">Stage ${tool.stage}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">${tool.name}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">${tool.description}</p>
            <button onclick="window.startToolPractice('${tool.id}')" class="w-full py-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-bold hover:bg-primary hover:text-white transition-all active:scale-95">Start Practice</button>
        </div>
    `).join('');
};

const startToolPractice = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    currentTool = tool;
    modalToolName.textContent = tool.name;
    modalToolCategory.textContent = tool.category;
    modalToolInstructions.textContent = tool.instructions;
    
    timeLeft = tool.duration * 60;
    updateTimerDisplay();
    
    toolModal.classList.remove('hidden');
    startTimer();
};

// Expose to window for onclick
(window as any).startToolPractice = startToolPractice;

const updateTimerDisplay = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const totalSeconds = currentTool ? currentTool.duration * 60 : 300;
    const percent = (timeLeft / totalSeconds) * 100;
    timerProgress.style.width = `${percent}%`;
};

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    isTimerPaused = false;
    btnPauseTimer.textContent = 'Pause';
    
    timerInterval = setInterval(() => {
        if (!isTimerPaused) {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showToast("Practice time complete!");
            }
        }
    }, 1000);
};

const toggleTimer = () => {
    isTimerPaused = !isTimerPaused;
    btnPauseTimer.textContent = isTimerPaused ? 'Resume' : 'Pause';
};

const handleCompletePractice = async () => {
    if (!currentUser || !currentTool) return;
    
    setLoading(true);
    try {
        await addDoc(collection(db, `users/${currentUser.uid}/tool_usage`), {
            toolId: currentTool.id,
            toolName: currentTool.name,
            duration: currentTool.duration,
            date: Timestamp.now(),
            completed: true
        });
        
        showToast("Practice recorded!");
        closeModal();
    } catch (error: any) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
};

const closeModal = () => {
    toolModal.classList.add('hidden');
    if (timerInterval) clearInterval(timerInterval);
    currentTool = null;
};

// --- Chart Initialization ---
const initRadarChart = (data = [50, 50, 50]) => {
    const ctx = (document.getElementById('si-radar-chart') as HTMLCanvasElement).getContext('2d');
    if (siChart) siChart.destroy();

    // @ts-ignore
    siChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Awareness', 'Reflection', 'Detachment'],
            datasets: [{
                label: 'SI Score',
                data: data,
                backgroundColor: 'rgba(45, 108, 223, 0.2)',
                borderColor: '#2D6CDF',
                borderWidth: 3,
                pointBackgroundColor: '#2D6CDF',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#2D6CDF',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { display: true, color: 'rgba(0,0,0,0.05)' },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false },
                    pointLabels: {
                        font: { family: 'Inter', size: 10, weight: 'bold' },
                        color: '#94a3b8'
                    }
                }
            },
            plugins: {
                legend: { display: false }
            },
            maintainAspectRatio: false
        }
    });

    // Update text scores
    document.getElementById('score-awareness').textContent = data[0].toString();
    document.getElementById('score-reflection').textContent = data[1].toString();
    document.getElementById('score-detachment').textContent = data[2].toString();
};

// --- Auth Functions ---
const handleLogout = async () => {
    setLoading(true);
    try {
        await signOut(auth);
        showToast("Logged out successfully");
        window.history.pushState({}, '', '/login');
        authOverlay.classList.remove('hidden');
    } catch (error: any) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
};

const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
        showToast("Welcome to SI Path!");
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
};

const handleEmailLogin = async () => {
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    
    if (!email || !password) {
        showToast("Please enter both email and password", 'error');
        return;
    }

    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Successfully logged in!");
    } catch (error: any) {
        console.error("Login Error:", error);
        let msg = "Failed to log in. Please check your credentials.";
        if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
        if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
        showToast(msg, 'error');
    } finally {
        setLoading(false);
    }
};

const handleEmailSignup = async () => {
    const name = (document.getElementById('signup-name') as HTMLInputElement).value;
    const email = (document.getElementById('signup-email') as HTMLInputElement).value;
    const password = (document.getElementById('signup-password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('signup-confirm-password') as HTMLInputElement).value;

    if (!name || !email || !password) {
        showToast("Please fill in all fields", 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match", 'error');
        return;
    }

    if (password.length < 6) {
        showToast("Password should be at least 6 characters", 'error');
        return;
    }

    setLoading(true);
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        showToast("Account created successfully!");
    } catch (error: any) {
        console.error("Signup Error:", error);
        let msg = "Failed to create account.";
        if (error.code === 'auth/email-already-in-use') msg = "This email is already in use.";
        if (error.code === 'auth/invalid-email') msg = "Invalid email address.";
        showToast(msg, 'error');
    } finally {
        setLoading(false);
    }
};

const handleForgotPassword = async (e: Event) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    if (!email) {
        showToast("Please enter your email first", 'error');
        return;
    }

    setLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        showToast("Password reset email sent!");
    } catch (error: any) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
};

// --- User Data Functions ---

const checkUserInFirestore = async (user: any) => {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                displayName: user.displayName || "User",
                email: user.email || null,
                phone: user.phoneNumber || null,
                current_stage: 1,
                si_score: 0,
                subscription_type: "Free",
                age_group: null,
                createdAt: serverTimestamp()
            });
            
            // Initialize progress (keeping existing sub-collection for app logic)
            const progressRef = doc(db, `users/${user.uid}/progress`, "current");
            await setDoc(progressRef, {
                currentStage: 1,
                awareness: 50,
                reflection: 50,
                detachment: 50,
                situationsAnalyzed: 0
            });
        }
    } catch (error: any) {
        console.error("Error checking user in Firestore:", error);
        showToast("Error initializing user: " + error.message, 'error');
    }
};

const fetchUserProgress = async (uid: string) => {
    try {
        const progressRef = doc(db, `users/${uid}/progress`, "current");
        const progressDoc = await getDoc(progressRef);
        
        if (progressDoc.exists()) {
            const data = progressDoc.data();
            userProgress = data;
            userStage = data.currentStage || 1;
            updateHomeUI(data);
            renderTools();
            if (!document.getElementById('view-stages').classList.contains('hidden')) {
                renderStagesCarousel();
            }
        } else {
            // Fallback for existing users without progress doc
            const data = { currentStage: 1, awareness: 50, reflection: 50, detachment: 50, situationsAnalyzed: 0 };
            userProgress = data;
            userStage = 1;
            await setDoc(progressRef, data);
            updateHomeUI(data);
            renderTools();
            if (!document.getElementById('view-stages').classList.contains('hidden')) {
                renderStagesCarousel();
            }
        }
    } catch (error: any) {
        console.error("Error fetching progress:", error);
        showToast("Error loading progress: " + error.message, 'error');
    }
};


const updateHomeUI = (data: any) => {
    // Update Chart
    initRadarChart([data.awareness, data.reflection, data.detachment]);

    // Update Analysis Card
    document.getElementById('analysis-count').textContent = data.situationsAnalyzed.toString();
    const analysisPercent = Math.min((data.situationsAnalyzed / 10) * 100, 100);
    document.getElementById('analysis-progress-bar').style.width = `${analysisPercent}%`;

    // Update Progress Path
    const stages = document.querySelectorAll('.stage-node');
    const activeLine = document.getElementById('progress-line-active');
    const currentStage = data.currentStage;

    stages.forEach((node, index) => {
        const stageNum = index + 1;
        const circle = node.querySelector('div');
        const label = node.querySelectorAll('p')[0];
        const status = node.querySelectorAll('p')[1];
        const checkIcon = circle.querySelector('svg');
        const numText = circle.querySelector('span');

        if (stageNum < currentStage) {
            // Completed
            circle.className = "w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-emerald-500 flex items-center justify-center text-white transition-all duration-500 shadow-sm";
            checkIcon.classList.remove('hidden');
            numText.classList.add('hidden');
            label.classList.replace('text-gray-400', 'text-emerald-500');
            status.textContent = "100%";
            status.classList.replace('text-gray-400', 'text-emerald-500');
        } else if (stageNum === currentStage) {
            // Current
            circle.className = "w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-primary flex items-center justify-center text-white transition-all duration-500 shadow-lg shadow-primary/30 scale-110";
            checkIcon.classList.add('hidden');
            numText.classList.remove('hidden');
            label.classList.replace('text-gray-400', 'text-primary');
            status.textContent = "In Progress";
            status.classList.replace('text-gray-400', 'text-primary');
        } else {
            // Locked
            circle.className = "w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-white transition-all duration-500 shadow-sm";
            checkIcon.classList.add('hidden');
            numText.classList.remove('hidden');
            label.classList.add('text-gray-400');
            status.textContent = "Locked";
            status.classList.add('text-gray-400');
        }
    });

    // Update line width (approximate)
    const lineWidth = ((currentStage - 1) / 4) * 100;
    activeLine.style.width = `${lineWidth}%`;
};

// --- Journal Templates ---
const journalTemplates: Record<number, string> = {
    1: "1. Are you in full control of your life? Name a few things you don't have control over today?\n2. Have you experienced any miracles or strange coincidences recently? Thoughts?\n3. Do you trust others (guru, scriptures, aspirants)? Importance of trust?\n4. During difficulty today, did you contemplate why we seek sustained happiness despite unpredictability?\n5. What chronic problem/irritation did you introspect on today?",
    2: "1. What challenged your perception of reality today?\n2. What key truth from Vedanta/discourse stood out?\n3. How did you contemplate sense organ limitations today?\n4. Did you perform actions as worship of the Supreme today?\n5. What affirmations did you use for correct perception?",
    3: "1. What negativities (fear, anxiety, sorrow) did you experience today?\n2. How did you detach from body-ego and possessiveness?\n3. Did you maintain equanimity in dualities (joy-sorrow)?\n4. What affirmations did you use for stress?\n5. How did you surrender to the Supreme during obstacles?",
    4: "1. Did you experience any moments of bliss or divine communion today?\n2. How did you build your personal relationship with the Lord?\n3. Did you contemplate on the Lord before/after actions?\n4. What worship or meditation did you perform?\n5. Did you recite prayers from waking to sleeping?",
    5: "1. How did you worship and honor the guru parampara today?\n2. What qualities of a guru did you practice (compassion, knowledge)?\n3. How did you guide disciples through the SI model?\n4. Did you teach with experiential knowledge?\n5. How did you adapt teachings for modern contexts?"
};

const loadJournalTemplate = async () => {
    if (!currentUser) return;
    
    // Only load template if textarea is empty
    if (journalSituation.value.trim() !== '') return;
    
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const currentStage = userDoc.data().current_stage || 1;
            const template = journalTemplates[currentStage];
            if (template) {
                journalSituation.value = template;
                const len = journalSituation.value.length;
                situationCounter.textContent = `${len} / 2000`;
            }
        }
    } catch (error) {
        console.error("Error loading journal template:", error);
    }
};

// --- View Management ---
const switchView = (viewId: string, params: any = {}) => {
    // Protection: Redirect to login if not authenticated and trying to access app views
    if (!currentUser && viewId !== 'home') {
        authOverlay.classList.remove('hidden');
        return;
    }

    views.forEach(view => {
        view.classList.add('hidden');
        if (view.id === `view-${viewId}`) {
            view.classList.remove('hidden');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('text-primary');
        item.classList.add('text-gray-400');
        if (item.getAttribute('data-view') === viewId) {
            item.classList.add('text-primary');
            item.classList.remove('text-gray-400');
        }
    });

    if (viewId === 'stage-detail' && params.id) {
        renderStageDetail(parseInt(params.id));
    }

    if (viewId === 'stages') {
        renderStagesCarousel();
    }

    if (viewId === 'profile') {
        renderProfile();
    }
    
    if (viewId === 'mentor') {
        loadMentorDashboard();
    }

    if (viewId === 'journal') {
        loadJournalTemplate();
    }

    if (viewId === 'home' && currentUser) {
        fetchUserProgress(currentUser.uid);
    }

    // Update URL without reloading
    let path = '/';
    if (viewId === 'stage-detail' && params.id) {
        path = `/stage/${params.id}`;
    } else if (viewId !== 'home') {
        path = `/${viewId}`;
    }
    
    window.history.pushState({ viewId, params }, '', path);
};

// Handle browser back/forward
window.onpopstate = (event) => {
    if (event.state) {
        switchView(event.state.viewId, event.state.params);
    } else {
        switchView('home');
    }
};

const renderStageDetail = async (stageId: number) => {
    // stageId is 1-based, stagesData is an array where stage.stage === stageId
    const stage = stagesData.find(s => s.stage === stageId);
    if (!stage) return;

    currentViewStageId = stageId;
    
    const stageHeaderTitle = document.getElementById('stage-header-title');
    if (stageHeaderTitle) stageHeaderTitle.textContent = `Stage ${stage.stage} – ${stage.name}`;
    
    const stageGoal = document.getElementById('stage-goal');
    if (stageGoal) stageGoal.textContent = stage.goal;

    // Render Objectives
    const stageObjectivesList = document.getElementById('stage-objectives-list');
    if (stageObjectivesList) {
        stageObjectivesList.innerHTML = stage.keyObjectives.map(obj => `<li>${obj}</li>`).join('');
    }

    // Render Practices
    const stagePracticesList = document.getElementById('stage-practices-list');
    if (stagePracticesList) {
        stagePracticesList.innerHTML = stage.bestPractices.map(practice => `
            <li class="flex items-start gap-3 group">
                <div class="mt-1 w-5 h-5 rounded-md border-2 border-teal-600/30 flex items-center justify-center flex-shrink-0 group-hover:border-teal-600 transition-colors">
                    <svg class="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-gray-600 dark:text-gray-300 text-sm">${practice}</span>
            </li>
        `).join('');
    }

    // Render Metrics
    const stageMetricsList = document.getElementById('stage-metrics-list');
    if (stageMetricsList) {
        stageMetricsList.innerHTML = stage.metrics.map(metric => `<li>${metric}</li>`).join('');
    }

    // Render Stage Tools
    const stageToolsList = document.getElementById('stage-tools-list');
    if (stageToolsList) {
        stageToolsList.innerHTML = ''; // Clear existing
        
        for (const tool of stage.stageTools) {
            const toolCard = document.createElement('div');
            toolCard.className = 'p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 space-y-4';
            
            const toolHeader = document.createElement('h4');
            toolHeader.className = 'font-bold text-gray-800 dark:text-white';
            toolHeader.textContent = tool.tool;
            toolCard.appendChild(toolHeader);
            
            const promptLabel = document.createElement('label');
            promptLabel.className = 'block text-sm text-gray-600 dark:text-gray-400 mb-2';
            promptLabel.textContent = tool.usageLogPrompt;
            toolCard.appendChild(promptLabel);
            
            const textarea = document.createElement('textarea');
            textarea.className = 'w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none';
            textarea.rows = 3;
            textarea.placeholder = tool.usageLogPrompt;
            // Sanitize tool name for ID
            const safeToolName = tool.tool.replace(/[^a-zA-Z0-9]/g, '_');
            textarea.id = `tool-log-${safeToolName}`;
            toolCard.appendChild(textarea);
            
            const saveBtn = document.createElement('button');
            saveBtn.className = 'px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors';
            saveBtn.textContent = 'Save Log';
            saveBtn.onclick = () => saveToolLog(tool.tool, textarea.value, saveBtn);
            
            const btnContainer = document.createElement('div');
            btnContainer.className = 'flex justify-end';
            btnContainer.appendChild(saveBtn);
            toolCard.appendChild(btnContainer);
            
            stageToolsList.appendChild(toolCard);
            
            // Load existing log if any
            if (currentUser) {
                try {
                    const logRef = doc(db, 'users', currentUser.uid, 'tool_usage_logs', safeToolName);
                    const logSnap = await getDoc(logRef);
                    if (logSnap.exists()) {
                        textarea.value = logSnap.data().log || '';
                    }
                } catch (e) {
                    console.error("Error loading tool log:", e);
                }
            }
        }
    }
};

const saveToolLog = async (toolName: string, logText: string, btn: HTMLButtonElement) => {
    if (!currentUser) {
        showToast("Please log in to save.", "error");
        return;
    }
    
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    try {
        const safeToolName = toolName.replace(/[^a-zA-Z0-9]/g, '_');
        const logRef = doc(db, 'users', currentUser.uid, 'tool_usage_logs', safeToolName);
        await setDoc(logRef, {
            toolName,
            log: logText,
            updatedAt: Timestamp.now()
        }, { merge: true });
        
        showToast("Log saved successfully!");
        btn.textContent = 'Saved!';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    } catch (error: any) {
        console.error("Error saving tool log:", error);
        showToast("Error saving log: " + error.message, "error");
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

const renderStagesCarousel = () => {
    const stages = stagesData;
    
    stagesCarousel.innerHTML = stages.map(stage => {
        const isLocked = userProgress ? stage.stage > userProgress.currentStage : true;
        const isCompleted = userProgress ? stage.stage < userProgress.currentStage : false;
        const isCurrent = userProgress ? stage.stage === userProgress.currentStage : false;

        return `
            <div class="min-w-full p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                <div class="w-full md:w-1/3 flex flex-col items-center text-center">
                    <div class="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] ${isCompleted ? 'bg-emerald-500' : (isCurrent ? 'bg-teal-600' : 'bg-gray-100 dark:bg-gray-700')} flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-xl mb-6 transition-all duration-500">
                        ${isCompleted ? '✓' : stage.stage}
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 dark:text-white mb-2">${stage.name}</h3>
                    <span class="px-4 py-1.5 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-600' : (isCurrent ? 'bg-teal-600/10 text-teal-600' : 'bg-gray-100 text-gray-400')} text-[10px] font-black uppercase tracking-widest">
                        ${isCompleted ? 'Completed' : (isCurrent ? 'Current Stage' : (isLocked ? 'Locked' : 'Available'))}
                    </span>
                </div>
                <div class="w-full md:w-2/3 space-y-6">
                    <div class="space-y-2">
                        <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">The Journey</h4>
                        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${stage.goal}</p>
                    </div>
                    <div class="pt-4">
                        <button onclick="window.app.navigateToStage(${stage.stage})" class="px-8 py-4 rounded-2xl ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20'} font-bold transition-all active:scale-95">
                            ${isLocked ? 'Stage Locked' : 'Explore Stage Details'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Render Indicators
    carouselIndicators.innerHTML = stages.map((_, index) => `
        <button onclick="window.app.moveCarousel(${index})" class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentCarouselIndex ? 'bg-teal-600 w-8' : 'bg-gray-200 dark:bg-gray-700'}"></button>
    `).join('');

    updateCarouselPosition();

    // Update overall progress bar
    if (userProgress) {
        const totalStages = stages.length;
        const baseProgress = (userProgress.currentStage - 1) / totalStages * 100;
        
        // Calculate current stage progress
        // Since metricTarget is gone, let's just use a simple progress or 0 for now
        const currentStageProgress = 0; 
        
        const overallProgress = baseProgress + currentStageProgress;
        carouselOverallProgress.style.width = `${overallProgress}%`;
    }
};

const moveCarousel = (index: number) => {
    const stagesCount = stagesData.length;
    if (index < 0) index = stagesCount - 1;
    if (index >= stagesCount) index = 0;
    
    currentCarouselIndex = index;
    updateCarouselPosition();
    
    // Update indicators
    const dots = carouselIndicators.querySelectorAll('button');
    dots.forEach((dot, i) => {
        if (i === currentCarouselIndex) {
            dot.classList.add('bg-teal-600', 'w-8');
            dot.classList.remove('bg-gray-200', 'dark:bg-gray-700');
        } else {
            dot.classList.remove('bg-teal-600', 'w-8');
            dot.classList.add('bg-gray-200', 'dark:bg-gray-700');
        }
    });
};

const updateCarouselPosition = () => {
    stagesCarousel.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
};

// Expose to window
(window as any).app = {
    ...(window as any).app,
    moveCarousel,
    navigateToStage: (id: number) => switchView('stage-detail', { id })
};

const switchAuthTab = (tab: 'login' | 'signup' | 'google') => {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    googleForm.classList.add('hidden');
    
    const tabs = [tabLogin, tabSignup, tabGoogle];
    tabs.forEach(t => {
        if (!t) return;
        t.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow-sm', 'text-primary', 'dark:text-white');
        t.classList.add('text-gray-500', 'dark:text-gray-400');
    });

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        tabLogin.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm', 'text-primary', 'dark:text-white');
        tabLogin.classList.remove('text-gray-500', 'dark:text-gray-400');
    } else if (tab === 'signup') {
        signupForm.classList.remove('hidden');
    } else if (tab === 'google') {
        googleForm.classList.remove('hidden');
        tabGoogle.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm', 'text-primary', 'dark:text-white');
        tabGoogle.classList.remove('text-gray-500', 'dark:text-gray-400');
    }
};

// --- Auth Functions ---

const handleContinueJourney = async () => {
    if (!currentUser || !currentViewStageId || !userProgress) return;

    // Just navigate to tools or journal to continue working
    try {
        const progressRef = doc(db, `users/${currentUser.uid}/progress`, "current");
        await updateDoc(progressRef, { lastJourneyUpdate: Timestamp.now() });
    } catch (e) {}
    
    switchView('tools');
    showToast("Keep practicing! Use the tools to increase your awareness.");
};

// Expose navigation to window for inline onclicks
(window as any).app = {
    navigateToStage: (id: number) => switchView('stage-detail', { id })
};

// --- Profile Functions ---
const renderProfile = async () => {
    if (!currentUser) return;

    // Basic Info
    profileName.textContent = currentUser.displayName || "Spiritual Seeker";
    profileEmail.textContent = currentUser.email;
    
    // Avatar
    if (currentUser.photoURL) {
        profileAvatar.src = currentUser.photoURL;
    } else {
        // Gravatar fallback
        const emailHash = btoa(currentUser.email.toLowerCase()).substring(0, 32); // Simple mock hash
        profileAvatar.src = `https://www.gravatar.com/avatar/${emailHash}?d=mp&f=y`;
    }

    // Fetch Total Reflections
    try {
        const q = query(collection(db, `users/${currentUser.uid}/journal_entries`));
        const snapshot = await getDocs(q);
        totalReflectionsCount.textContent = snapshot.size.toString();
    } catch (e) {
        console.error("Error fetching reflections count:", e);
    }

    // SI Score Radar
    if (userProgress) {
        initProfileRadarChart([userProgress.awareness, userProgress.reflection, userProgress.detachment]);
    }

    // Subscription Status
    const isPremium = userProgress?.isPremium || false;
    const isFullUnlocked = userProgress?.isFullUnlocked || false;
    
    if (isFullUnlocked) {
        subscriptionStatus.innerHTML = `
            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            Full Path Unlocked
        `;
        btnUpgradeFull.classList.add('hidden');
    } else {
        subscriptionStatus.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
            Free – Stage ${userStage} Active
        `;
        btnUpgradeFull.classList.remove('hidden');
    }

    // Timeline
    renderProfileTimeline();

    // Settings
    profileDarkModeToggle.checked = document.documentElement.classList.contains('dark');
    
    // Mentor Status
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const mentorStatusEl = document.getElementById('mentor-status');
        if (mentorStatusEl && userDoc.exists()) {
            const mentorId = userDoc.data().mentorId;
            if (mentorId) {
                const mentorDoc = await getDoc(doc(db, 'users', mentorId));
                mentorStatusEl.textContent = `Linked to ${mentorDoc.exists() ? mentorDoc.data().displayName || 'Mentor' : 'Mentor'}`;
            } else {
                mentorStatusEl.textContent = 'Not linked';
            }
        }
    } catch (e) {
        console.error("Error fetching mentor status:", e);
    }
};

const initProfileRadarChart = (data: number[]) => {
    const ctx = (document.getElementById('profile-si-radar') as HTMLCanvasElement).getContext('2d');
    if (profileSiChart) profileSiChart.destroy();

    // @ts-ignore
    profileSiChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Awareness', 'Reflection', 'Detachment'],
            datasets: [{
                label: 'SI Score',
                data: data,
                backgroundColor: 'rgba(45, 108, 223, 0.2)',
                borderColor: '#2D6CDF',
                borderWidth: 3,
                pointBackgroundColor: '#2D6CDF',
                pointBorderColor: '#fff',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false },
                    pointLabels: { font: { size: 10, weight: 'bold' } }
                }
            },
            plugins: { legend: { display: false } },
            maintainAspectRatio: false
        }
    });
};

const renderProfileTimeline = () => {
    const userStage = userProgress?.currentStage || 1;
    profileTimeline.innerHTML = `
        <div class="absolute top-4 left-8 right-8 h-0.5 bg-gray-100 dark:bg-gray-700"></div>
        ${stagesData.map(stage => {
            const isCompleted = stage.stage < userStage;
            const isCurrent = stage.stage === userStage;
            return `
                <div class="flex flex-col items-center gap-2 relative z-10">
                    <div class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 ${isCompleted ? 'bg-emerald-500' : (isCurrent ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700')} flex items-center justify-center text-white transition-all shadow-sm">
                        <span class="text-[10px] font-bold">${isCompleted ? '✓' : stage.stage}</span>
                    </div>
                    <span class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">${stage.name.split(' ')[0]}</span>
                </div>
            `;
        }).join('')}
    `;
};

const handleAvatarChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !currentUser) return;

    setLoading(true);
    try {
        // In a real app, we'd upload to Firebase Storage
        // For this demo, we'll use a FileReader to show it locally and mock the update
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            profileAvatar.src = base64;
            
            // Mock updateProfile (Firebase updateProfile doesn't support large base64, but for demo UI it works)
            await updateProfile(currentUser, { photoURL: base64 });
            showToast("Avatar updated");
        };
        reader.readAsDataURL(file);
    } catch (error: any) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
};

const handleExportData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
        const q = query(collection(db, `users/${currentUser.uid}/journal_entries`));
        const snapshot = await getDocs(q);
        const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `si_path_reflections_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        showToast("Data exported successfully");
    } catch (error: any) {
        showToast("Export failed: " + error.message, 'error');
    } finally {
        setLoading(false);
    }
};

const handleRazorpayPayment = (amount: number, description: string) => {
    // @ts-ignore
    const options = {
        key: "rzp_test_dummykey", // Replace with real key in production
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "SI Path",
        description: description,
        image: "https://ais-dev-hmyhxtkzwtmgm6lxqlrl2e-170330924771.asia-southeast1.run.app/logo.png",
        handler: async function (response: any) {
            showToast("Payment Successful! ID: " + response.razorpay_payment_id);
            
            // Update user status in Firestore
            const progressRef = doc(db, `users/${currentUser.uid}/progress`, "current");
            if (description.includes("Full Path")) {
                await updateDoc(progressRef, { isFullUnlocked: true });
            } else {
                await updateDoc(progressRef, { isPremium: true });
            }
            renderProfile();
        },
        prefill: {
            name: currentUser.displayName,
            email: currentUser.email
        },
        theme: {
            color: "#2D6CDF"
        }
    };
    // @ts-ignore
    const rzp = new Razorpay(options);
    rzp.open();
};

// --- Theme Management ---
const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Sync profile toggle if it exists
    if (profileDarkModeToggle) {
        profileDarkModeToggle.checked = isDark;
    }
    updateThemeIcons();
};

const updateThemeIcons = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
};

// --- Mentor Dashboard Functions ---
const mentorSearchInput = document.getElementById('mentor-search') as HTMLInputElement;
const mentorFilterStage = document.getElementById('mentor-filter-stage') as HTMLSelectElement;
const mentorParticipantsGrid = document.getElementById('mentor-participants-grid') as HTMLElement;
const mentorEmptyState = document.getElementById('mentor-empty-state') as HTMLElement;
const mentorCodeDisplay = document.getElementById('mentor-code-display') as HTMLElement;
const btnCopyMentorCode = document.getElementById('btn-copy-mentor-code') as HTMLButtonElement;
const navMentor = document.getElementById('nav-mentor') as HTMLElement;

// Mentor Modal Elements
const mentorDetailModal = document.getElementById('mentor-detail-modal') as HTMLElement;
const closeMentorModalBtn = document.getElementById('close-mentor-modal') as HTMLButtonElement;
const btnMentorExportPdf = document.getElementById('btn-mentor-export-pdf') as HTMLButtonElement;
const btnMentorExportCsv = document.getElementById('btn-mentor-export-csv') as HTMLButtonElement;
const mdAvatar = document.getElementById('md-avatar') as HTMLElement;
const mdName = document.getElementById('md-name') as HTMLElement;
const mdJoinDate = document.getElementById('md-join-date') as HTMLElement;
const mdAgeGroup = document.getElementById('md-age-group') as HTMLElement;
const mdStageName = document.getElementById('md-stage-name') as HTMLElement;
const mdStageGoal = document.getElementById('md-stage-goal') as HTMLElement;
const mdStageProgressText = document.getElementById('md-stage-progress-text') as HTMLElement;
const mdStageProgressBar = document.getElementById('md-stage-progress-bar') as HTMLElement;
const mdTimelineActive = document.getElementById('md-timeline-active') as HTMLElement;
const mdTimelineNodes = document.getElementById('md-timeline-nodes') as HTMLElement;
const mdJournalList = document.getElementById('md-journal-list') as HTMLElement;
const mdAnalyzedRatio = document.getElementById('md-analyzed-ratio') as HTMLElement;
const mdTotalEntries = document.getElementById('md-total-entries') as HTMLElement;
const mdFeedbackText = document.getElementById('md-feedback-text') as HTMLTextAreaElement;
const mdApproveAdvance = document.getElementById('md-approve-advance') as HTMLInputElement;
const btnSaveFeedback = document.getElementById('btn-save-feedback') as HTMLButtonElement;
const btnAdvanceStage = document.getElementById('btn-advance-stage') as HTMLButtonElement;
const mdNextStageNum = document.getElementById('md-next-stage-num') as HTMLElement;
const mdFeedbackHistory = document.getElementById('md-feedback-history') as HTMLElement;

let allMentees: any[] = [];
let currentMenteeId: string | null = null;

const loadMentorDashboard = async () => {
    if (!currentUser) return;
    
    // Show the mentor nav button for everyone (or you could restrict it based on a role)
    navMentor.classList.remove('hidden');
    
    // Display mentor code (using UID for simplicity)
    mentorCodeDisplay.textContent = currentUser.uid;
    
    setLoading(true);
    try {
        const q = query(collection(db, 'users'), where('mentorId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        allMentees = [];
        querySnapshot.forEach((docSnap) => {
            allMentees.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Fetch additional data for each mentee (e.g., analyzed count, last journal entry)
        for (let mentee of allMentees) {
            try {
                // Get analyzed count for this month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                console.log(`[Query] Fetching journal entries for mentee ${mentee.id} since ${startOfMonth.toISOString()}`);
                const analyzedQuery = query(
                    collection(db, `users/${mentee.id}/journal_entries`),
                    where("date", ">=", Timestamp.fromDate(startOfMonth))
                );
                const analyzedSnap = await getDocs(analyzedQuery);
                mentee.analyzedCount = analyzedSnap.docs.filter(doc => doc.data().analyzed === true).length;
                
                // Get last journal entry
                console.log(`[Query] Fetching last journal entry for mentee ${mentee.id}`);
                const lastEntryQuery = query(
                    collection(db, `users/${mentee.id}/journal_entries`),
                    orderBy("date", "desc"),
                    limit(1)
                );
                const lastEntrySnap = await getDocs(lastEntryQuery);
                if (!lastEntrySnap.empty) {
                    mentee.lastEntryDate = lastEntrySnap.docs[0].data().date.toDate();
                } else {
                    mentee.lastEntryDate = null;
                }
            } catch (error: any) {
                console.error(`Error fetching data for mentee ${mentee.id}:`, error);
                if (error.message && error.message.includes('requires an index')) {
                    showToast("Creating Firestore index... try again in 5 min", 'error');
                    console.log("Create index here:", error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]);
                }
                mentee.analyzedCount = 0;
                mentee.lastEntryDate = null;
            }
        }
        
        renderMentees();
    } catch (error) {
        console.error("Error loading mentees:", error);
        showToast("Failed to load participants", "error");
    } finally {
        setLoading(false);
    }
};

const renderMentees = () => {
    const searchTerm = mentorSearchInput.value.toLowerCase();
    const stageFilter = mentorFilterStage.value;
    
    const filteredMentees = allMentees.filter(mentee => {
        const matchesSearch = (mentee.displayName || 'Unknown').toLowerCase().includes(searchTerm);
        const matchesStage = stageFilter === 'all' || String(mentee.current_stage || 1) === stageFilter;
        return matchesSearch && matchesStage;
    });
    
    if (allMentees.length === 0) {
        mentorEmptyState.classList.remove('hidden');
        mentorParticipantsGrid.classList.add('hidden');
    } else {
        mentorEmptyState.classList.add('hidden');
        mentorParticipantsGrid.classList.remove('hidden');
        
        mentorParticipantsGrid.innerHTML = filteredMentees.map(mentee => {
            const stageNum = mentee.current_stage || 1;
            const stageData = stagesData.find(s => s.stage === stageNum);
            const stageName = stageData?.name || `Stage ${stageNum}`;
            const progress = mentee.si_score || 0; // Using si_score as progress for now
            const lastActive = mentee.lastEntryDate ? mentee.lastEntryDate.toLocaleDateString() : 'Never';
            const ageGroup = mentee.age_group || 'Not specified';
            
            return `
                <div class="bg-teal-50/50 dark:bg-teal-900/20 rounded-2xl p-6 shadow-sm border border-teal-100 dark:border-teal-800/50 flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-teal-900 dark:text-teal-100">${mentee.displayName || 'Unknown'}</h3>
                            <p class="text-sm text-teal-600 dark:text-teal-400">${ageGroup}</p>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shadow-inner">
                            ${(mentee.displayName || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <p class="text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">Stage ${stageNum}: ${stageName}</p>
                        <div class="w-full bg-teal-100 dark:bg-teal-900/50 rounded-full h-2 mb-1 overflow-hidden">
                            <div class="bg-teal-500 h-2 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                        </div>
                        <p class="text-xs text-teal-600 dark:text-teal-400 text-right font-medium">${progress}% Progress</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6 flex-grow">
                        <div class="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-teal-50 dark:border-teal-900/30">
                            <p class="text-xs text-teal-600/80 dark:text-teal-400/80 mb-1">Last Active</p>
                            <p class="text-sm font-semibold text-teal-900 dark:text-teal-100">${lastActive}</p>
                        </div>
                        <div class="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-teal-50 dark:border-teal-900/30">
                            <p class="text-xs text-teal-600/80 dark:text-teal-400/80 mb-1">Analyzed</p>
                            <p class="text-sm font-semibold text-teal-900 dark:text-teal-100">${mentee.analyzedCount}/10 this month</p>
                        </div>
                    </div>
                    
                    <button class="w-full py-2.5 px-4 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-medium transition-colors shadow-sm" onclick="window.openMentorModal('${mentee.id}')">
                        View Details
                    </button>
                </div>
            `;
        }).join('');
    }
};

(window as any).openMentorModal = async (menteeId: string) => {
    const mentee = allMentees.find(m => m.id === menteeId);
    if (!mentee) return;
    
    currentMenteeId = menteeId;
    
    // Populate Basic Info
    mdName.textContent = mentee.displayName || 'Unknown';
    mdAvatar.textContent = (mentee.displayName || 'U').charAt(0).toUpperCase();
    mdJoinDate.textContent = mentee.createdAt ? mentee.createdAt.toDate().toLocaleDateString() : 'Unknown';
    mdAgeGroup.textContent = mentee.age_group || 'Not specified';
    
    // Stage Info
    const stageNum = mentee.current_stage || 1;
    const stageData = stagesData.find(s => s.stage === stageNum);
    mdStageName.textContent = `Stage ${stageNum}: ${stageData?.name || 'Unknown'}`;
    mdStageGoal.textContent = stageData?.goal || 'No goal specified.';
    
    const progress = mentee.si_score || 0;
    mdStageProgressText.textContent = `${progress}%`;
    mdStageProgressBar.style.width = `${progress}%`;
    
    // Timeline Nodes
    mdTimelineNodes.innerHTML = stagesData.map(stage => {
        const isCompleted = stage.stage < stageNum;
        const isCurrent = stage.stage === stageNum;
        let nodeClass = 'bg-teal-100 dark:bg-teal-900/50 text-teal-400 dark:text-teal-600 border-4 border-white dark:border-gray-800';
        if (isCompleted) nodeClass = 'bg-teal-500 text-white border-4 border-white dark:border-gray-800';
        if (isCurrent) nodeClass = 'bg-white dark:bg-gray-800 text-teal-600 border-4 border-teal-500 shadow-md';
        
        return `
            <div class="flex flex-col items-center gap-2 relative z-10 w-8">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${nodeClass}">
                    ${isCompleted ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : stage.stage}
                </div>
            </div>
        `;
    }).join('');
    
    const activeTimelineWidth = ((stageNum - 1) / (stagesData.length - 1)) * 100;
    mdTimelineActive.style.width = `${activeTimelineWidth}%`;
    
    // Metrics
    mdAnalyzedRatio.textContent = `${mentee.analyzedCount || 0}/10`;
    
    // Fetch Journal Entries
    try {
        console.log(`[Query] Fetching recent journal entries for mentee ${menteeId}`);
        const q = query(
            collection(db, `users/${menteeId}/journal_entries`),
            orderBy('date', 'desc'),
            limit(10)
        );
        const snapshot = await getDocs(q);
        mdTotalEntries.textContent = snapshot.size.toString(); // Total of last 10 for now, or we can do a separate count query
        
        if (snapshot.empty) {
            mdJournalList.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">No journal entries yet.</p>';
        } else {
            mdJournalList.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                const date = data.date.toDate().toLocaleDateString();
                const moodMap: Record<string, string> = { happy: '😊', neutral: '😐', sad: '😔', angry: '😠', calm: '😌' };
                const emoji = moodMap[data.mood] || '📝';
                
                let audioHtml = '';
                if (data.audioUrl) {
                    audioHtml = `<audio controls src="${data.audioUrl}" class="h-8 w-full mt-3"></audio>`;
                }
                
                return `
                    <details class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm group overflow-hidden">
                        <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">${emoji}</span>
                                <div>
                                    <span class="text-sm font-bold text-gray-700 dark:text-gray-200 block">${date}</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px]">${data.situation || 'No text provided.'}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                ${data.analyzed ? '<span class="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase rounded-md">Analyzed</span>' : ''}
                                <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </summary>
                        <div class="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 mt-2">
                            <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mt-3">${data.situation || 'No text provided.'}</p>
                            ${audioHtml}
                        </div>
                    </details>
                `;
            }).join('');
        }
    } catch (e: any) {
        console.error("Error fetching journal entries:", e);
        if (e.message && e.message.includes('requires an index')) {
            showToast("Creating Firestore index... try again in 5 min", 'error');
            console.log("Create index here:", e.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]);
            mdJournalList.innerHTML = '<p class="text-sm text-red-500">Requires index. Check console.</p>';
        } else {
            mdJournalList.innerHTML = '<p class="text-sm text-red-500">Error loading entries.</p>';
        }
    }
    
    // Fetch Feedback History
    try {
        const fq = query(
            collection(db, `users/${menteeId}/mentor_feedback`),
            orderBy('timestamp', 'desc')
        );
        const fSnapshot = await getDocs(fq);
        if (fSnapshot.empty) {
            mdFeedbackHistory.innerHTML = '<p class="text-xs text-gray-500 dark:text-gray-400">No previous feedback.</p>';
        } else {
            mdFeedbackHistory.innerHTML = fSnapshot.docs.map(doc => {
                const data = doc.data();
                const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'Unknown';
                return `
                    <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-bold text-gray-500 dark:text-gray-400">${date}</span>
                            ${data.approvedAdvancement ? '<span class="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase">Approved</span>' : ''}
                        </div>
                        <p class="text-sm text-gray-700 dark:text-gray-300">${data.notes}</p>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Error fetching feedback:", e);
        mdFeedbackHistory.innerHTML = '<p class="text-xs text-red-500">Error loading history.</p>';
    }
    
    // Reset Form
    mdFeedbackText.value = '';
    mdApproveAdvance.checked = false;
    btnAdvanceStage.classList.add('hidden');
    
    if (stageNum < stagesData.length) {
        mdNextStageNum.textContent = (stageNum + 1).toString();
    } else {
        mdApproveAdvance.parentElement?.parentElement?.classList.add('hidden'); // Hide approve if at max stage
    }

    mentorDetailModal.classList.remove('hidden');
};

if (closeMentorModalBtn) {
    closeMentorModalBtn.addEventListener('click', () => {
        mentorDetailModal.classList.add('hidden');
        currentMenteeId = null;
    });
}

if (btnMentorExportCsv) {
    btnMentorExportCsv.addEventListener('click', async () => {
        if (!currentMenteeId) return;
        setLoading(true);
        try {
            const q = query(collection(db, `users/${currentMenteeId}/journal_entries`), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            
            let csvContent = "Date,Mood,Analyzed,Text,Audio URL\n";
            
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const date = data.date.toDate().toLocaleDateString();
                const mood = data.mood || '';
                const analyzed = data.analyzed ? 'Yes' : 'No';
                const text = (data.situation || '').replace(/"/g, '""');
                const audioUrl = data.audioUrl || '';
                
                csvContent += `"${date}","${mood}","${analyzed}","${text}","${audioUrl}"\n`;
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `reflections_${currentMenteeId}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            showToast("CSV exported successfully");
        } catch (error: any) {
            console.error("Error exporting CSV:", error);
            if (error.message && error.message.includes('requires an index')) {
                showToast("Creating Firestore index... try again in 5 min", 'error');
                console.log("Create index here:", error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]);
            } else {
                showToast("Export failed: " + error.message, 'error');
            }
        } finally {
            setLoading(false);
        }
    });
}

if (btnMentorExportPdf) {
    btnMentorExportPdf.addEventListener('click', async () => {
        if (!currentMenteeId) return;
        setLoading(true);
        try {
            const q = query(collection(db, `users/${currentMenteeId}/journal_entries`), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            
            const doc = new jsPDF();
            let yPos = 20;
            const pageHeight = doc.internal.pageSize.height;
            
            doc.setFontSize(16);
            doc.text(`Reflections Export - ${new Date().toLocaleDateString()}`, 20, yPos);
            yPos += 15;
            
            doc.setFontSize(12);
            snapshot.docs.forEach((documentSnapshot, index) => {
                const data = documentSnapshot.data();
                const date = data.date.toDate().toLocaleDateString();
                const mood = data.mood || 'N/A';
                const analyzed = data.analyzed ? 'Yes' : 'No';
                const text = data.situation || 'No text provided.';
                const audioUrl = data.audioUrl || '';
                
                // Check if we need a new page
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFont("helvetica", "bold");
                doc.text(`Entry ${index + 1} - ${date}`, 20, yPos);
                yPos += 7;
                
                doc.setFont("helvetica", "normal");
                doc.text(`Mood: ${mood} | Analyzed: ${analyzed}`, 20, yPos);
                yPos += 7;
                
                const splitText = doc.splitTextToSize(`Text: ${text}`, 170);
                doc.text(splitText, 20, yPos);
                yPos += (splitText.length * 7);
                
                if (audioUrl) {
                    doc.setTextColor(0, 0, 255);
                    doc.text(`Audio: ${audioUrl}`, 20, yPos);
                    doc.setTextColor(0, 0, 0);
                    yPos += 7;
                }
                
                yPos += 10; // Space between entries
            });
            
            doc.save(`reflections_${currentMenteeId}_${new Date().toISOString().split('T')[0]}.pdf`);
            showToast("PDF exported successfully");
        } catch (error: any) {
            console.error("Error exporting PDF:", error);
            if (error.message && error.message.includes('requires an index')) {
                showToast("Creating Firestore index... try again in 5 min", 'error');
                console.log("Create index here:", error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]);
            } else {
                showToast("Export failed: " + error.message, 'error');
            }
        } finally {
            setLoading(false);
        }
    });
}

if (mdApproveAdvance) {
    mdApproveAdvance.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
            btnAdvanceStage.classList.remove('hidden');
        } else {
            btnAdvanceStage.classList.add('hidden');
        }
    });
}

if (btnSaveFeedback) {
    btnSaveFeedback.addEventListener('click', async () => {
        if (!currentMenteeId || !currentUser) return;
        
        const notes = mdFeedbackText.value.trim();
        const approved = mdApproveAdvance.checked;
        
        if (!notes && !approved) {
            showToast("Please enter notes or approve advancement.", "error");
            return;
        }
        
        setLoading(true);
        try {
            await addDoc(collection(db, `users/${currentMenteeId}/mentor_feedback`), {
                mentorId: currentUser.uid,
                notes: notes,
                approvedAdvancement: approved,
                timestamp: serverTimestamp()
            });
            showToast("Feedback saved successfully!");
            // Refresh modal data
            (window as any).openMentorModal(currentMenteeId);
        } catch (e) {
            console.error("Error saving feedback:", e);
            showToast("Failed to save feedback", "error");
        } finally {
            setLoading(false);
        }
    });
}

if (btnAdvanceStage) {
    btnAdvanceStage.addEventListener('click', async () => {
        if (!currentMenteeId) return;
        
        const mentee = allMentees.find(m => m.id === currentMenteeId);
        if (!mentee) return;
        
        const currentStage = mentee.current_stage || 1;
        const nextStage = currentStage + 1;
        const nextStageData = stagesData.find(s => s.stage === nextStage);
        if (!nextStageData) return;
        
        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentMenteeId);
            await updateDoc(userRef, {
                current_stage: nextStage,
                si_score: 0 // Reset progress for new stage
            });
            
            // Add notification
            const notificationsRef = collection(db, `users/${currentMenteeId}/notifications`);
            await addDoc(notificationsRef, {
                type: 'stage_approved',
                message: `Your mentor approved your progression to Stage ${nextStage} – ${nextStageData.name}`,
                read: false,
                mentorName: currentUser?.displayName || 'Your Mentor',
                timestamp: serverTimestamp()
            });
            
            showToast(`Participant advanced to Stage ${currentStage + 1}!`);
            
            // Refresh dashboard data
            await loadMentorDashboard();
            
            // Refresh modal
            (window as any).openMentorModal(currentMenteeId);
            
        } catch (e) {
            console.error("Error advancing stage:", e);
            showToast("Failed to advance stage", "error");
        } finally {
            setLoading(false);
        }
    });
}

if (mentorSearchInput) {
    mentorSearchInput.addEventListener('input', renderMentees);
}
if (mentorFilterStage) {
    mentorFilterStage.addEventListener('change', renderMentees);
}
if (btnCopyMentorCode) {
    btnCopyMentorCode.addEventListener('click', () => {
        navigator.clipboard.writeText(currentUser?.uid || '');
        showToast("Mentor code copied to clipboard!");
    });
}

// --- Notifications ---
const listenForNotifications = (uid: string) => {
    if (notificationsUnsubscribe) {
        notificationsUnsubscribe();
    }
    const q = query(
        collection(db, `users/${uid}/notifications`), 
        where('read', '==', false), 
        orderBy('timestamp', 'desc')
    );
    notificationsUnsubscribe = onSnapshot(q, (snapshot) => {
        const notifications: any[] = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        renderNotifications(notifications);
    });
};

const renderNotifications = (notifications: any[]) => {
    if (!homeNotificationBanner) return;
    
    if (notifications.length > 0) {
        homeNotificationBanner.classList.remove('hidden');
        homeNotificationBanner.innerHTML = notifications.map(notif => `
            <div class="bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500 p-4 rounded-r-xl shadow-sm mb-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="bg-teal-100 dark:bg-teal-800 p-2 rounded-full text-teal-600 dark:text-teal-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </div>
                    <div>
                        <p class="text-teal-800 dark:text-teal-200 font-medium">${notif.message}</p>
                        <p class="text-xs text-teal-600 dark:text-teal-400 mt-1">From: ${notif.mentorName}</p>
                    </div>
                </div>
                <button onclick="markNotificationRead('${notif.id}')" class="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 p-2 rounded-full hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>
        `).join('');
    } else {
        homeNotificationBanner.classList.add('hidden');
        homeNotificationBanner.innerHTML = '';
    }
};

(window as any).markNotificationRead = async (notifId: string) => {
    if (!currentUser) return;
    try {
        const notifRef = doc(db, `users/${currentUser.uid}/notifications`, notifId);
        await updateDoc(notifRef, { read: true });
    } catch (error) {
        console.error("Error marking notification read:", error);
    }
};

// --- Initialization ---
const init = () => {
    // Show loading spinner until auth resolved
    setLoading(true);

    // Auth Listeners
    onAuthStateChanged(auth, async (user) => {
        setLoading(true);
        try {
            if (user) {
                currentUser = user;
                
                // Ensure user exists in Firestore before fetching progress
                await checkUserInFirestore(user);
                await fetchUserProgress(user.uid);
                listenForNotifications(user.uid);
                
                greetingText.textContent = `${getGreeting()}, ${user.displayName || "Friend"}`;
                authOverlay.classList.add('hidden');

                // Redirect to /home if on /login (or if auth overlay was visible)
                const path = window.location.pathname;
                if (path === '/' || path === '/login') {
                    switchView('home');
                } else {
                    // Re-run routing to show protected content
                    const stageMatch = path.match(/\/stage\/(\d+)/);
                    if (stageMatch) {
                        switchView('stage-detail', { id: stageMatch[1] });
                    } else if (path === '/stages') {
                        switchView('stages');
                    } else if (path === '/journal') {
                        switchView('journal');
                    } else if (path === '/tools') {
                        switchView('tools');
                    } else if (path === '/profile') {
                        switchView('profile');
                    } else {
                        switchView('home');
                    }
                }
                
                console.log("User logged in:", user.uid);
            } else {
                currentUser = null;
                if (notificationsUnsubscribe) {
                    notificationsUnsubscribe();
                    notificationsUnsubscribe = null;
                }
                authOverlay.classList.remove('hidden');
                // Redirect to /login
                if (window.location.pathname !== '/login') {
                    window.history.pushState({}, '', '/login');
                }
                switchAuthTab('login');
            }
        } catch (error) {
            console.error("Auth state change error:", error);
        } finally {
            setLoading(false);
        }
    });

    // Event Listeners
    const googleSigninBtn = document.getElementById('google-signin');
    if (googleSigninBtn) googleSigninBtn.addEventListener('click', handleGoogleSignIn);
    
    document.getElementById('btn-login').addEventListener('click', handleEmailLogin);
    document.getElementById('btn-signup').addEventListener('click', handleEmailSignup);
    document.getElementById('forgot-password').addEventListener('click', handleForgotPassword);
    btnLogout.addEventListener('click', handleLogout);
    
    tabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (tabGoogle) tabGoogle.addEventListener('click', () => switchAuthTab('google'));
    if (linkToSignup) linkToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signup');
    });

    themeToggle.addEventListener('click', toggleTheme);

    btnChangeAvatar.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', handleAvatarChange);
    btnExportData.addEventListener('click', handleExportData);
    btnUpgradeFull.addEventListener('click', () => handleRazorpayPayment(999, "Upgrade to Full Path"));
    btnGoPremium.addEventListener('click', () => handleRazorpayPayment(199, "Go Premium Subscription"));
    btnProfileLogout.addEventListener('click', handleLogout);
    profileDarkModeToggle.addEventListener('change', toggleTheme);
    btnConnectMentor.addEventListener('click', async () => {
        if (!currentUser) return;
        
        const currentMentorStatus = document.getElementById('mentor-status')?.textContent;
        if (currentMentorStatus !== 'Not linked') {
            showToast("You are already linked to a mentor.");
            return;
        }

        const mentorCode = prompt("Enter your Mentor's Code:");
        if (!mentorCode) return;
        
        if (mentorCode === currentUser.uid) {
            showToast("You cannot be your own mentor.", "error");
            return;
        }

        setLoading(true);
        try {
            // Verify mentor exists
            const mentorDocRef = doc(db, 'users', mentorCode);
            const mentorDoc = await getDoc(mentorDocRef);
            
            if (!mentorDoc.exists()) {
                showToast("Invalid mentor code.", "error");
                return;
            }
            
            // Link mentor
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, { mentorId: mentorCode }, { merge: true });
            
            const mentorStatusEl = document.getElementById('mentor-status');
            if (mentorStatusEl) {
                mentorStatusEl.textContent = `Linked to ${mentorDoc.data().displayName || 'Mentor'}`;
            }
            
            showToast("Successfully linked to mentor!");
        } catch (error) {
            console.error("Error linking mentor:", error);
            showToast("Failed to link mentor.", "error");
        } finally {
            setLoading(false);
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // Navigation buttons inside cards
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
            const viewId = btn.getAttribute('data-nav');
            switchView(viewId);
        });
    });

    // Stage Node Listeners
    document.querySelectorAll('.stage-node').forEach(node => {
        node.addEventListener('click', () => {
            const stageId = node.getAttribute('data-stage');
            if (stageId) {
                switchView('stage-detail', { id: stageId });
            }
        });
    });

    // Journal Listeners
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            handleMoodSelect(mood);
        });
    });

    journalSituation.addEventListener('input', () => {
        const len = journalSituation.value.length;
        situationCounter.textContent = `${len} / 500`;
    });

    journalNotes.addEventListener('input', () => {
        const len = journalNotes.value.length;
        notesCounter.textContent = `${len} / 300`;
    });

    journalAnalyzed.addEventListener('change', () => {
        toggleLabel.textContent = journalAnalyzed.checked ? 'Yes' : 'No';
        toggleLabel.classList.toggle('text-accent', journalAnalyzed.checked);
        toggleLabel.classList.toggle('text-gray-400', !journalAnalyzed.checked);
    });

    btnSaveJournal.addEventListener('click', handleJournalSave);
    
    // Recording Events
    btnStartRecord.addEventListener('click', startRecording);
    btnStopRecord.addEventListener('click', stopRecording);
    btnDeleteAudio.addEventListener('click', deleteAudio);
    btnTranscribeAudio.addEventListener('click', transcribeAudio);

    btnContinueJourney.addEventListener('click', handleContinueJourney);

    // Carousel Listeners
    btnPrevStage.addEventListener('click', () => moveCarousel(currentCarouselIndex - 1));
    btnNextStage.addEventListener('click', () => moveCarousel(currentCarouselIndex + 1));

    // Tools Listeners
    toolSearch.addEventListener('input', renderTools);
    toolFilter.addEventListener('change', renderTools);
    closeToolModal.addEventListener('click', closeModal);
    btnPauseTimer.addEventListener('click', toggleTimer);
    btnCompletePractice.addEventListener('click', handleCompletePractice);

    // Set initial journal date
    journalDate.textContent = formatDate(new Date());

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    updateThemeIcons();

    // Initial Routing
    const path = window.location.pathname;
    const stageMatch = path.match(/\/stage\/(\d+)/);
    if (stageMatch) {
        switchView('stage-detail', { id: stageMatch[1] });
    } else if (path === '/stages') {
        switchView('stages');
    } else if (path === '/journal') {
        switchView('journal');
    } else if (path === '/tools') {
        switchView('tools');
    } else if (path === '/profile') {
        switchView('profile');
    } else if (path === '/mentor') {
        switchView('mentor');
    } else {
        switchView('home');
    }
};

init();
