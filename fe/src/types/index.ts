export interface Detection {
    id: string;
    label: string;
    confidence: number;
    timestamp: string;
}

export interface SystemStats {
    fps: number;
    cpu_temp: number;
    gpu_usage: number;
    is_connected: boolean;
}

export interface DetectionEvent {
    id: string;
    timestamp: string;
    label: string;      
    confidence: number;  
    bbox?: { x: number; y: number; w: number; h: number };
}

export interface SystemStats {
    droneCount: number;
    fps: number;
    cpuTemp?: number;
    gpuUsage?: number;
}