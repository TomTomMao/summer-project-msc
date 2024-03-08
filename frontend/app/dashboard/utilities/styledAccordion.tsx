// this file is modified from this page's customization section: https://mui.com/material-ui/react-accordion/
import * as React from 'react';
import { styled } from '@mui/material/styles'; // reference: https://mui.com/material-ui
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'; // reference: https://mui.com/material-ui
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'; // reference: https://mui.com/material-ui
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary'; // reference: https://mui.com/material-ui
import MuiAccordionDetails from '@mui/material/AccordionDetails'; // reference: https://mui.com/material-ui
const ACCORDION_SUMMARY_HEIGHT = 30
export const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

export const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    minHeight: ACCORDION_SUMMARY_HEIGHT,
    maxHeight: ACCORDION_SUMMARY_HEIGHT,
}));

export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(1),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));
