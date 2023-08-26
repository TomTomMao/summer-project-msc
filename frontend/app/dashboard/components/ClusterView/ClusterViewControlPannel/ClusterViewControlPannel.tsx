import { FrequencyControlPannel } from "./FrequencyControlPannel";
import { Accordion, AccordionDetails, AccordionSummary} from "@/app/dashboard/utilities/styledAccordion";
import { Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ClusterViewMappingControlPannel } from "./ClusterViewMappingControlPannel";
import { ClusterAlgorithmControlPannel } from "./ClusterAlgorithmControlPannel";

export const MIN_NUMBER_CLUSTER = 2
export const MAX_NUMBER_CLUSTER = 100

export default function ClusterViewControlPannel() {
    return (
        <>
            <div style={{ width: 500, border: 'black 1px solid' }}>
                <Accordion
                    defaultExpanded={true} >
                    {/* reference: https://mui.com/material-ui/react-accordion/ */}
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>visual mapping</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ClusterViewMappingControlPannel></ClusterViewMappingControlPannel>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    defaultExpanded={true} >
                    {/* reference: https://mui.com/material-ui/react-accordion/ */}
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>clustering</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ClusterAlgorithmControlPannel></ClusterAlgorithmControlPannel>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    defaultExpanded={true} >
                    {/* reference: https://mui.com/material-ui/react-accordion/ */}
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>transaction group</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <FrequencyControlPannel></FrequencyControlPannel>
                    </AccordionDetails>
                </Accordion>
            </div>
        </>
    )
}


