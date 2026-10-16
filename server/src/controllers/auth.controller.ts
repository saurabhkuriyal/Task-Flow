import type { Request, Response } from "express";
const signUp = async (req: Request, res: Response) => {
    try {

        res.status(200).json({
            message: "OK",
            success: true,
        })
    } catch (error) {
        console.log(error);
    }
}

export default {
    signUp
}