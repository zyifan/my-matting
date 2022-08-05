import {
	INITIAL_RADIUS,
	INITIAL_HARDNESS,
	RADIUS_TO_BRUSH_SIZE_RATIO,
	HARDNESS_ZOOM_TO_SLIDER_RATIO,
	INITIAL_TRANSFORM_CONFIG,
} from '@/constants';
import { createContext2D } from '@/helpers/dom-helper';
import ListenerManager from '@/helpers/listener-manager';
import { BoardRect, TransformConfig } from '@/types/common';
import { ImageSources, InitMattingBaseConfig, InitMattingResult, MattingProps } from '@/types/init-matting';
import { ref, computed, Ref, reactive } from 'vue';
import { useInitDrawingListeners, useInitTransformListener } from './use-init-listeners';
import { useInitMattingBoards } from './use-init-matting';


// 初始化表单数据
export function useMatting() {
	const picFile = ref<null | File>(null);
	const isErasing = ref(false);
	const radius = ref(INITIAL_RADIUS);
	const hardness = ref(INITIAL_HARDNESS);
	const brushSize = computed(() => radius.value * RADIUS_TO_BRUSH_SIZE_RATIO);
	const hardnessText = computed(() => `${Math.round((hardness.value as number) * HARDNESS_ZOOM_TO_SLIDER_RATIO)}%`);

	return {
		picFile,
		isErasing,
		radius,
		hardness,
		brushSize,
		hardnessText,
	};
}

// create a new canvas and return it's context 2d
const inputDrawingCtx: CanvasRenderingContext2D = createContext2D();
const outputDrawingCtx: CanvasRenderingContext2D = createContext2D();

// 初始化抠图相关数据
export function useMattingBoard(props: MattingProps) {
	const width = ref(0); // input canvas 宽
	const height = ref(0); // input canvas 高	
	const inputCtx: Ref<CanvasRenderingContext2D | null> = ref(null); // input canvas context 2d
	const outputCtx: Ref<CanvasRenderingContext2D | null> = ref(null); // output canvas context 2d
	const initMattingResult: Ref<InitMattingResult | null> = ref(null); // 初始化得到的作为绘制源的图像资源
	const draggingInputBoard = ref(false); // input board拖拽状态
	const isDrawing = ref(false); // 正在绘制状态
	const transformConfig: TransformConfig = reactive(INITIAL_TRANSFORM_CONFIG); // 变换配置对象
	const mattingSources: Ref<ImageSources | null> = ref(null); // 源图像资源 raw、mask、orig
	const boardRect: Ref<BoardRect | null> = ref(null); // 画板矩形的参数 width、height
	const initialized = ref(false); // 初始化完成状态
	const inputHiddenCtx = ref(createContext2D()); // create a new canvas and return it's context 2d
	const outputHiddenCtx = ref(createContext2D()); // create a new canvas and return it's context 2d

	// 
	const listenerManager = new ListenerManager();

	// 初始化抠图的组合API的基础配置对
	const initMattingConfig: InitMattingBaseConfig = {
		boardContexts: { inputCtx, outputCtx, inputDrawingCtx, outputDrawingCtx, inputHiddenCtx, outputHiddenCtx }, // input、output 绘制所需的所有 context 2d 对象
		initMattingResult, // 初始化得到的作为绘制源的图像资源
		transformConfig, // 默认的变换配置对象
		mattingSources, // 源图
		initialized, // 初始化完成状态
		boardRect,  // 画板矩形的参数 width、height
	};

	const initListenersConfig = { ...initMattingConfig, draggingInputBoard, isDrawing, listenerManager };
	useInitMattingBoards(props, { ...initMattingConfig, width, height });
	useInitDrawingListeners(props, initListenersConfig);
	useInitTransformListener(initListenersConfig);


	return {
		width,
		height,
		inputCtx,
		outputCtx,
		inputHiddenCtx,
		outputHiddenCtx,
		draggingInputBoard,
		transformConfig,
		initialized,
		mattingSources,
	};
}
