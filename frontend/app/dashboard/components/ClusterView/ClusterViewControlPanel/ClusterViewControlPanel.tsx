import { FrequencyControlPanel } from "./FrequencyControlPanel";
import { Accordion, AccordionDetails, AccordionSummary} from "@/app/dashboard/utilities/styledAccordion";
import { Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ClusterViewMappingControlPanel } from "./ClusterViewMappingControlPanel";
import { ClusterAlgorithmControlPanel } from "./ClusterAlgorithmControlPanel";

export const MIN_NUMBER_CLUSTER = 2
export const MAX_NUMBER_CLUSTER = 100

export default function ClusterViewControlPanel() {
    return (
        <>
            <div style={{ width: 450, border: 'black 1px solid' }}>
                <Accordion
                    defaultExpanded={true} >
                    {/* reference: https://mui.com/material-ui/react-accordion/ */}
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Visual Mapping</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ClusterViewMappingControlPanel></ClusterViewMappingControlPanel>
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
                        <Typography>Clustering</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ClusterAlgorithmControlPanel></ClusterAlgorithmControlPanel>
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
                        <Typography>Transaction Group</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <FrequencyControlPanel></FrequencyControlPanel>
                    </AccordionDetails>
                </Accordion>
            </div>
        </>
    )
}


