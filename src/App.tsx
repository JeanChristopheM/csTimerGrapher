import { useEffect, useState } from "react";
import {
    convertData,
    formatSecondsToDuration,
    generateRandomColor,
} from "./utils";
import { Data } from "./interfaces";
import "./style.scss";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    TimeSeriesScale,
} from "chart.js";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    TimeSeriesScale,
    Title,
    Tooltip,
    Legend,
);

const App = () => {
    //. State
    const [data, setData] = useState<Data>();
    const [solves, setSolves] = useState<Map<number, number>>(new Map());

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        const text = await file.text();
        const data = await convertData(text);
        setData(data);
    };

    const renderBestSingle = () => {
        const res = formatSecondsToDuration(
            Number(
                Array.from(solves.values())
                    .sort((a, b) => a - b)
                    .filter((t) => t !== 0)[0],
            ) / 1000,
        );
        return res;
    };

    //. Refreshes solves
    useEffect(() => {
        data &&
            setSolves(
                data.sessions.reduce((acc, session) => {
                    session.solves.forEach((solve) => {
                        acc.set(solve.createdAt, solve.time);
                    });
                    return acc;
                }, new Map()),
            );
    }, [data]);

    //. Early return
    if (!data || !solves.size)
        return (
            <div>
                <label htmlFor="dataInput">
                    Select your cstimer data file:
                    <input
                        type="file"
                        name="dataInput"
                        id="dataInput"
                        onChange={handleFileChange}
                    />
                </label>
            </div>
        );

    return (
        <div>
            <label htmlFor="dataInput">
                Select your cstimer data file:
                <input
                    type="file"
                    name="dataInput"
                    id="dataInput"
                    onChange={handleFileChange}
                />
            </label>
            <Line
                options={{
                    responsive: true,
                    layout: {
                        padding: 50,
                    },
                    plugins: {
                        legend: {
                            position: "left" as const,
                        },
                        title: {
                            display: true,
                            text: "All time solves",
                        },
                        tooltip: {
                            titleColor: "rgba(120,50,255,0.8)",
                            callbacks: {
                                label: (context) =>
                                    formatSecondsToDuration(
                                        Number(context.formattedValue),
                                    ),
                            },
                        },
                    },
                    scales: {
                        x: {
                            type: "timeseries",
                            title: {
                                display: true,
                                text: "Date",
                            },
                        },
                        y: {
                            clip: true,
                            beginAtZero: true,
                            ticks: {
                                // stepSize: 15000,
                                callback: (value) =>
                                    formatSecondsToDuration(
                                        Number(value) / 1000,
                                    ),
                            },
                            grid: {
                                color: (context) => {
                                    const value = context.tick.value;
                                    return value > 60000
                                        ? "rgba(255,255,255,0.1)"
                                        : "rgba(0,255,0,0.4)";
                                },
                            },
                        },
                    },
                }}
                data={{
                    labels: Array.from(solves.keys()).map((ts) =>
                        DateTime.fromMillis(ts * 1000).toJSDate(),
                    ),
                    datasets: data.sessions.map((session) => ({
                        label: session.name,
                        data: Array.from(solves.keys()).reduce((acc, time) => {
                            const solve = session.solves.find(
                                (s) => s.createdAt === time,
                            );
                            if (solve && solve.time !== 0)
                                acc.push({
                                    x: DateTime.fromMillis(
                                        time * 1000,
                                    ).toJSDate(),
                                    y: solve.time,
                                });
                            return acc;
                        }, [] as { x: Date; y: number }[]),
                        // borderColor: "white",
                        borderColor: generateRandomColor(),
                        // backgroundColor: generateRandomColor(),
                        backgroundColor: "rgba(255,255,255,0.05)",
                    })),
                }}
            />
            <section>
                <p>Best single: {renderBestSingle()}</p>
            </section>
        </div>
    );
};

export default App;
