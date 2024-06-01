'use client';

import uploadImage from '@api/unoai/unoai';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

interface IPrediction {
	name: string;
	points: number;
	color: string;
}

const Home = () => {
	const predictionTimeout = useRef<NodeJS.Timeout | null>(null);
	const isDetectingRef = useRef<boolean>(false);

	const webcamRef = useRef<Webcam>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [isDetecting, setIsDetecting] = useState(false);
	const [videoWidth, setVideoWidth] = useState(0);
	const [videoHeight, setVideoHeight] = useState(0);
	const [tempScore, setTempScore] = useState(0);
	const [score, setScore] = useState(0);
	const [predictions, setPredictions] = useState<IPrediction[]>([]);

	const cardObjects = [
		{ name: '0', points: 0, color: 'red' },
		{ name: '1', points: 1, color: 'red' },
		{ name: '2', points: 2, color: 'red' },
		{ name: '3', points: 3, color: 'red' },
		{ name: '4', points: 4, color: 'red' },
		{ name: '5', points: 5, color: 'red' },
		{ name: '6', points: 6, color: 'red' },
		{ name: '7', points: 7, color: 'red' },
		{ name: '8', points: 8, color: 'red' },
		{ name: '9', points: 9, color: 'red' },
		{ name: '+4', points: 50, color: 'lime' },
		{ name: '+2', points: 20, color: 'lime' },
		{ name: 'Reverse', points: 20, color: 'lime' },
		{ name: 'Skip', points: 20, color: 'lime' },
		{ name: 'Change color', points: 50, color: 'lime' },
	];

	const videoConstraints = {
		width: videoWidth,
		height: videoHeight,
		facingMode: 'environment',
	};

	const predictionFunction = async () => {
		if (!isDetectingRef.current && predictionTimeout.current) {
			clearTimeout(predictionTimeout.current);
			return;
		} else {
			try {
				let imageSrc;
				if (webcamRef.current) {
					imageSrc = webcamRef.current.getScreenshot();
				}

				const res = await uploadImage(
					imageSrc ? imageSrc.split(';base64,')[1] : ''
				);
				const predictions = res.result;
				drawBoundingBoxes(predictions);
			} catch (error) {
				console.log(error);
			}

			predictionTimeout.current = setTimeout(predictionFunction, 150);
		}
	};

	function drawBoundingBoxes(predictions: any) {
		let cnvs;
		if (canvasRef.current) {
			cnvs = canvasRef.current;
		}

		if (!cnvs) return;
		const ctx = cnvs.getContext('2d');

		if (!ctx) return;
		ctx.clearRect(0, 0, cnvs.width, cnvs.height);

		let predictionsArray = [];
		let curScore = 0;
		for (let i = 0; i < predictions.length; i++) {
			const prediction = predictions[i];
			let { name, confidence, xmin, ymin, xmax, ymax } = prediction;

			const predictionObject = {
				name: cardObjects[+name].name,
				points: cardObjects[+name].points,
				color: cardObjects[+name].color,
			};

			curScore += cardObjects[+name].points;
			predictionsArray.push(predictionObject);

			const color = cardObjects[+name].color;
			name = cardObjects[+name].name;

			ctx.beginPath();
			ctx.rect(xmin, ymin, xmax - xmin, ymax - ymin);
			ctx.strokeStyle = color;
			ctx.lineWidth = 3;
			ctx.stroke();

			ctx.font = '18px Arial';
			ctx.fillStyle = color;
			ctx.fillText(`${name}: ${confidence.toFixed(2)}`, xmin, ymin - 5);
		}
		setPredictions(predictionsArray);
		setTempScore(curScore);
	}

	const addToFinalScore = () => {
		let newScore = score + tempScore;
		setScore(newScore);
	};

	useEffect(() => {
		isDetectingRef.current = isDetecting;

		if (
			isDetecting &&
			!predictionTimeout.current &&
			isDetectingRef.current == isDetecting
		) {
			predictionFunction();
		} else {
			if (predictionTimeout.current) {
				clearTimeout(predictionTimeout.current);
				predictionTimeout.current = null;
			}
		}

		return () => {
			if (predictionTimeout.current) {
				clearTimeout(predictionTimeout.current);
				predictionTimeout.current = null;
			}
		};
	}, [isDetecting]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const width = window.innerWidth;
			const height = window.innerHeight;
			setVideoWidth(width);
			setVideoHeight(height);

			if (canvasRef.current) {
				canvasRef.current.width = width;
				canvasRef.current.height = height;
			}

			if (webcamRef.current && webcamRef.current.video) {
				webcamRef.current.video.width = width;
				webcamRef.current.video.height = height;
			}
		}
	}, []);

	const startDetecting = () => {
		setIsDetecting(true);
	};

	const stopDetecting = () => {
		setIsDetecting(false);
		setTempScore(0);
		setPredictions([]);
		canvasRef.current
			?.getContext('2d')
			?.clearRect(0, 0, videoWidth, videoHeight);

		if (predictionTimeout.current) {
			clearTimeout(predictionTimeout.current);
			predictionTimeout.current = null;
		}

		setTimeout(() => {
			if (predictionTimeout.current) {
				clearTimeout(predictionTimeout.current);
				predictionTimeout.current = null;
			}

			setTempScore(0);
			setPredictions([]);
			canvasRef.current
				?.getContext('2d')
				?.clearRect(0, 0, videoWidth, videoHeight);
		}, 500);
	};

	useEffect(() => {
		if (!isDetecting) {
			setTempScore(0);
			setPredictions([]);
			canvasRef.current
				?.getContext('2d')
				?.clearRect(0, 0, videoWidth, videoHeight);
		}
	}, [predictionTimeout.current, isDetectingRef.current, isDetecting]);

	return (
		<main className="flex flex-col gap-4">
			<div className="h-fit w-full sm:justify-start justify-between flex gap-4 pt-4 px-4">
				<button
					className="bg-green500 text-black p-4"
					onClick={() => startDetecting()}
				>
					Start detecting
				</button>
				<button
					className="bg-error text-black p-4"
					onClick={() => stopDetecting()}
				>
					Stop detecting
				</button>
			</div>
			<div className="flex h-screen w-full flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-4">
				<div className="w-fit h-fit">
					<div className="absolute top-[90px] left-0 z-50 w-fit h-fit">
						<canvas
							ref={canvasRef}
							id="myCanvas"
							width={videoWidth}
							height={videoHeight}
							style={{ backgroundColor: 'transparent' }}
						/>
					</div>
					<div className="relative top-0 left-0 w-fit h-fit">
						<Webcam
							audio={false}
							id="img"
							ref={webcamRef}
							screenshotQuality={1}
							screenshotFormat="image/jpeg"
							videoConstraints={videoConstraints}
						/>
					</div>
				</div>
				<div className="relative top-0 left-0 lg:w-fit right-0 w-full h-fit z-50">
					<div className="w-full lg:w-[400px] px-4 h-fit flex flex-col gap-4 lg:px-10">
						{isDetecting && (
							<p className="bg-green500 text-black p-4 rounded-md text-lg">
								Detecting...
							</p>
						)}
						<h1 className="text-xl">
							Score: <span className="font-bold">{score}</span>
						</h1>
						{predictions.map((prediction, index) => (
							<div
								key={index}
								className="flex justify-between bg-black text-white p-4"
							>
								<p>{prediction?.name}</p>
								<p>
									Points: <span>{prediction?.points}</span>
								</p>
							</div>
						))}
						<div className="flex justify-between items-center">
							<h2 className="text-xl">
								Current Score: <span className="font-bold">{tempScore}</span>
							</h2>
							<button
								className="text-lg text-white bg-black px-4 py-2 rounded-md"
								onClick={() => addToFinalScore()}
							>
								Add
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Home;
