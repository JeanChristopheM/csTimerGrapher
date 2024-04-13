export interface SessionData {
    name: number | string;
    opt: Record<string, object>;
    rank: number;
    stat?: [number, number, number];
    date?: [number, number];
}

export type Session = {
    name: string;
    solves: Solve[];
};

export type Solve = {
    time: number;
    scramble: string;
    createdAt: number;
};

export type Data = {
    sessions: Session[];
    properties: {
        sessionData: Record<string, SessionData>;
        toolsfunc: string[];
        uidesign: string;
        session: number;
    };
};
