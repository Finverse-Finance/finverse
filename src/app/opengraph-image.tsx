import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Finverse - Personal Finance Management";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: "linear-gradient(to bottom, #FEF3C7, #FFEDD5)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                }}
            >
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: "bold",
                        marginBottom: 40,
                        color: "#F97316",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <div
                        style={{
                            background: "#F97316",
                            color: "white",
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                        }}
                    >
                        F
                    </div>
                    Finverse
                </div>
                <div
                    style={{
                        fontSize: 36,
                        color: "#78350F",
                        textAlign: "center",
                        maxWidth: "80%",
                    }}
                >
                    Personal Finance Management
                </div>
                <div
                    style={{
                        fontSize: 24,
                        color: "#92400E",
                        marginTop: 40,
                        textAlign: "center",
                    }}
                >
                    Track accounts, manage transactions, and get AI-powered insights
                </div>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported opengraph-image
            // size config to also set the ImageResponse width and height.
            ...size,
        }
    );
}
