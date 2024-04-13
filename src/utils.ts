import { Duration } from "luxon";
import { Data, SessionData } from "./interfaces";

export const convertData = async (fileString: string) => {
    const data = JSON.parse(fileString);

    const sessionNames = Object.values(
        (await JSON.parse(data.properties.sessionData)) as SessionData,
    ).reduce((acc: Map<number, string | number>, sessionData: SessionData) => {
        acc.set(sessionData.rank, sessionData.name);
        return acc;
    }, new Map<number, string | number>());

    const parsedData = Object.keys(data).reduce((acc, key, i) => {
        if (key !== "properties" && data[key].length) {
            if (!acc.sessions) Object.assign(acc, { sessions: [] });
            acc.sessions.push({
                name: sessionNames.get(i + 1),
                solves: data[key].map(
                    (t: [number[], string, string, number]) => {
                        if (t[0][0] !== 0 && t[0][0] !== -1)
                            console.warn(
                                `First number in solve time is weird: ${t[0][0]}`,
                            );
                        return {
                            time: t[0][0] === -1 ? 0 : t[0][1],
                            scramble: t[1],
                            createdAt: t[3],
                        };
                    },
                ),
            });
        }
        return acc;
    }, {} as Data);

    return parsedData;
};

export const formatSecondsToDuration = (s: number) => {
    const duration = Duration.fromMillis(s * 1000);
    if (Number(duration.toFormat("s")) === 0) return "0";
    if (Number(duration.toFormat("s")) < 60) return duration.toFormat("s's'SS");
    return `${duration.toFormat("m'm'ss's'")}`;
};

export const generateRandomColor = (): string => {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    return `rgb(${red < 100 ? red + 50 : red}, ${
        green < 100 ? green + 50 : green
    }, ${blue < 100 ? blue + 50 : blue})`;
};
