import type { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const LinearProgressWithLabel = (props: LinearProgressProps & { value: number; maxValue: number }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {props.value} / {props.maxValue}
                </Typography>
            </Box>
        </Box>
    );
};
