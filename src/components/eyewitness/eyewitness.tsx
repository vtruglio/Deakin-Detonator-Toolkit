import { Button, LoadingOverlay, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { UserGuide } from "../UserGuide/UserGuide";
import { SaveOutputToTextFile_v2 } from "../SaveOutputToFile/SaveOutputToTextFile";
import { LoadingOverlayAndCancelButton } from "../OverlayAndCancelButton/OverlayAndCancelButton";

const title = "EyeWitness";
const description_userguide =
    "EyeWitness takes screenshots of websites, provides information about the server header, and identifies default credentials (if known). It presents this information in a HTML report. " +
    " \n\nEyeWitness's information page:https://www.kali.org/tools/eyewitness/#eyewitness" +
    " \n\nHow to use EyeWitness:" +
    "\n\nStep 1: Create a plain text file on your local drive and add URLs to it. Each URL must be on its own line. Add the file path to the text file in the first field." +
    "\n\nStep 2: Add the file path for where you want the output saved in the second field." +
    "\n\nStep3: Add a number in the third field for the maximum number of seconds for EyeWitness to try and screenshot a webpage, e.g. 20. " +
    "\n\nStep 4: Press the scan button. ";

interface FormValues {
    filepath: string;
    directory: string;
    timeout: string;
}

export function Eyewitness() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [pid, setPid] = useState("");
    const [allowSave, setAllowSave] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    let form = useForm({
        initialValues: {
            filepath: "",
            directory: "",
            timeout: "",
        },
    });

    // Uses the callback function of runCommandGetPidAndOutput to handle and save data
    // generated by the executing process into the output state variable.
    const handleProcessData = useCallback((data: string) => {
        setOutput((prevOutput) => prevOutput + "\n" + data); // Update output
    }, []);
    // Uses the onTermination callback function of runCommandGetPidAndOutput to handle
    // the termination of that process, resetting state variables, handling the output data,
    // and informing the user.

    const handleProcessTermination = useCallback(
        ({ code, signal }: { code: number; signal: number }) => {
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(`\nProcess terminated with exit code: ${code} and signal code: ${signal}`);
            }
            // Clear the child process pid reference
            setPid("");
            // Cancel the Loading Overlay
            setLoading(false);

            // Allow Saving as the output is finalised
            setAllowSave(true);
            setHasSaved(false);
        },
        [handleProcessData]
    );

    // Actions taken after saving the output
    const handleSaveComplete = () => {
        // Indicating that the file has saved which is passed
        // back into SaveOutputToTextFile to inform the user
        setHasSaved(true);
        setAllowSave(false);
    };

    const onSubmit = async (values: FormValues) => {
        // Disallow saving until the tool's execution is complete
        setAllowSave(false);

        // Enable the Loading Overlay
        setLoading(true);

        const args = [`-f`, `${values.filepath}`];

        args.push(`--web`);

        args.push(`-d`, `${values.directory}`);

        args.push(`--timeout`, `${values.timeout}`);

        args.push(`--no-prompt`);

        CommandHelper.runCommandGetPidAndOutput("eyewitness", args, handleProcessData, handleProcessTermination)
            .then(({ pid, output }) => {
                setPid(pid);
                setOutput(output);
            })
            .catch((error) => {
                setLoading(false);
                setOutput(`Error: ${error.message}`);
            });
    };

    const clearOutput = useCallback(() => {
        setOutput("");
        setHasSaved(false);
        setAllowSave(false);
    }, [setOutput]);

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            {LoadingOverlayAndCancelButton(loading, pid)}
            <Stack>
                {UserGuide(title, description_userguide)}
                <TextInput
                    label={"Enter the file name or path containing URLs:"}
                    placeholder={"Example: /home/kali/Desktop/filename"}
                    required
                    {...form.getInputProps("filepath")}
                />
                <TextInput
                    label={"Enter the directory name where you want to save screenshots or define path of directory:"}
                    placeholder={"Example: /home/kali/Directory name"}
                    required
                    {...form.getInputProps("directory")}
                />
                <TextInput label={"Enter the timeout time"} required {...form.getInputProps("timeout")} />
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <Button type={"submit"}>Scan</Button>
                {SaveOutputToTextFile_v2(output, allowSave, hasSaved, handleSaveComplete)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
}
export default Eyewitness;
