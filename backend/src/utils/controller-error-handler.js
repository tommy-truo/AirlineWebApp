// Written by Tommy Truong

// Helper for consistent error handling
export const handleControllerError = (res, err, consoleMessage = "Controller Error", statusCode = 500, resMessage = "Internal Server Error") => {
    console.error(consoleMessage, err)
    res.status(statusCode).json({
        success: false,
        message: resMessage
    });
};