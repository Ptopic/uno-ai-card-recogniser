'use client';

import uploadImage from '@api/unoai/unoai';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

interface IPrediction {
	name: string;
	points: number;
	color: string;
}

const Home = () => {
	const webcamRef = useRef<Webcam>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [stopDetecting, setStopDetecting] = useState(false);

	const [videoWidth, setVideoWidth] = useState(960);
	const [videoHeight, setVideoHeight] = useState(640);

	const [tempScore, setTempScore] = useState(0);
	const [score, setScore] = useState(0);

	const [predictions, setPredictions] = useState<IPrediction[]>([]);

	const cardObjects = [
		{
			name: '0',
			points: 0,
			color: 'red',
		},
		{
			name: '1',
			points: 1,
			color: 'red',
		},
		{
			name: '2',
			points: 2,
			color: 'red',
		},
		{
			name: '3',
			points: 3,
			color: 'red',
		},
		{
			name: '4',
			points: 4,
			color: 'red',
		},
		{
			name: '5',
			points: 5,
			color: 'red',
		},
		{
			name: '6',
			points: 6,
			color: 'red',
		},
		{
			name: '7',
			points: 7,
			color: 'red',
		},
		{
			name: '8',
			points: 8,
			color: 'red',
		},
		{
			name: '9',
			points: 9,
			color: 'red',
		},
		{
			name: '+4',
			points: 50,
			color: 'lime',
		},
		{
			name: '+2',
			points: 20,
			color: 'lime',
		},
		{
			name: 'Reverse',
			points: 20,
			color: 'lime',
		},
		{
			name: 'Skip',
			points: 20,
			color: 'lime',
		},
		{
			name: 'Change color',
			points: 50,
			color: 'lime',
		},
	];

	const videoConstraints = {
		height: videoHeight,
		width: videoWidth,
		facingMode: 'environment',
	};

	const startDetecting = async () => {
		setStopDetecting(false);
		predictionFunction();
	};

	async function predictionFunction() {
		if (stopDetecting) return;
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

		setTimeout(() => predictionFunction(), 150);
	}

	function drawBoundingBoxes(predictions: any) {
		// const cnvs = document.querySelector(
		// 	'#video-container > #myCanvas'
		// ) as HTMLCanvasElement;

		let cnvs;
		if (canvasRef.current) {
			cnvs = canvasRef.current;
		}

		if (!cnvs) return;
		const ctx = cnvs.getContext('2d');

		if (!ctx) return;
		// Clear previous drawings
		ctx.clearRect(0, 0, cnvs.width, cnvs.height);

		// Loop through predictions
		let predictionsArray = [];
		let curScore = 0;
		for (let i = 0; i < predictions.length; i++) {
			const prediction = predictions[i];
			let { name, confidence, xmin, ymin, xmax, ymax } = prediction;

			// Convert name string to number
			const predictionObject = {
				name: cardObjects[+name].name,
				points: cardObjects[+name].points,
				color: cardObjects[+name].color,
			};

			curScore += cardObjects[+name].points;

			predictionsArray.push(predictionObject);

			const color = cardObjects[+name].color;
			const points = cardObjects[+name].points;
			name = cardObjects[+name].name;

			// Draw bounding box
			ctx.beginPath();
			ctx.rect(xmin, ymin, xmax - xmin, ymax - ymin);
			ctx.strokeStyle = color;
			ctx.lineWidth = 3;
			ctx.stroke();

			// Add label
			ctx.font = '18px Arial';
			ctx.fillStyle = color;
			ctx.fillText(`${name}: ${confidence.toFixed(2)}`, xmin, ymin - 5);
		}
		setPredictions(predictionsArray);
		setTempScore(curScore);
	}

	const addToFinalScore = () => {
		setScore(score + tempScore);
	};

	useEffect(() => {
		const handleResize = () => {
			setVideoWidth(window.innerWidth);
			setVideoHeight(window.innerHeight);
		};

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<main>
			<div className="h-fit w-fit flex gap-4">
				<button
					className="bg-white text-black"
					onClick={() => startDetecting()}
				>
					Start detection
				</button>
				<button
					className="bg-white text-black"
					onClick={() => setStopDetecting(true)}
				>
					Stop detection
				</button>
			</div>
			<div className="flex h-screen w-full flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-4">
				<div className="w-fit h-fit">
					<div className="absolute top-6 left-0 z-50 w-fit h-fit">
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
				<div className="w-[400px] h-fit flex flex-col gap-4 lg:pr-10">
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
		</main>
	);
};

export default Home;
