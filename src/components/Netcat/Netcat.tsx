import { Button, NativeSelect, Stack, TextInput, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCallback, useState } from "react";
import { CommandHelper } from "../../utils/CommandHelper";
import ConsoleWrapper from "../ConsoleWrapper/ConsoleWrapper";
import { SaveOutputToTextFile } from "../SaveOutputToFile/SaveOutputToTextFile";
import { UserGuide } from "../UserGuide/UserGuide";

const title = "Netcat Tool";
const description_userguide =
    "Netcat is a powerful tool that is used to connect two machines together for communication and for other uses.\n" +
    "How to use this netcat tool:\n" +
    "- If you want to listen for connections for chat or reverse shell choose the Interactive shell/Listen option and provide \n a port number.\n" +
    "- If you want to scan for ports, provide an IP address and a port range\n" +
    "- If you want to send a file, provide the destination IP address, Port number, and File name\n" +
    "- If you want to receive a file, provide a port number and the File name.\n" +
    "- If you want to port scan a domain, provide Domain name and a Port number. \n" +
    "Note: You should only use website port scan to a domain that you own.\n" +
    "Note 2: Using the sending/receiving file option might seem like it is not working, but it is working.\n" +
    "You will need a second machine to see the file transfer\n" +
    "For more information go to the reference page and click on netcat, alternatively Google is your friend.";

//Variables
interface FormValuesType {
    ipAddress: string;
    portNumber: string;
    netcatOptions: string;
    websiteUrl: string;
    filePath: string;
}

//Netcat Options
const netcatOptions = ["Port Scan", "Send File", "Receive File", "Website Port scan"];

//Tool name must be capital or jsx will cry out errors :P
const NetcatTool = () => {
    var [output, setOutput] = useState("");
    const [selectedScanOption, setSelectedNetcatOption] = useState("");
    const [checkedVerboseMode, setCheckedVerboseMode] = useState(false);

    let form = useForm({
        initialValues: {
            ipAddress: "",
            portNumber: "",
            netcatOptions: "",
            websiteUrl: "",
            filePath: "",
        },
    });

    const onSubmit = async (values: FormValuesType) => {
        //Starts off with the IP address after netcat
        //Ex: nc <ip address>
        let args = [``];

        //If verbose mode is checked, v flag is added to args
        const verboseFlag = checkedVerboseMode ? "v" : "";

        //Switch case
        switch (values.netcatOptions) {
            case "Port Scan": //nc syntax: nc -zv <ip address/hostname> <port range>
                //addition of -n will not perform any dns or name lookups.

                args = [`-z${verboseFlag}n`];
                args.push(`${values.ipAddress}`);

                if (values.portNumber.includes("-")) {
                    //checks for port range specifed by the inclusion of "-"
                    const [portStart, portEnd] = values.portNumber.split("-").map(Number); //Splits range by "-", assigns two consts with the split port numbers

                    for (let currentPort = portStart; currentPort <= portEnd; currentPort++) {
                        //Iterates through every port from start to end
                        try {
                            let output = await CommandHelper.runCommand("nc", [...args, String(currentPort)]);
                            setOutput(output);
                        } catch (e: any) {
                            setOutput(e);
                        }
                    }
                } else {
                    //else port number has been inputted
                    args.push(`${values.portNumber}`);

                    try {
                        let output = await CommandHelper.runCommand("nc", args);
                        setOutput(output);
                    } catch (e: any) {
                        setOutput(e);
                    }
                }

                break;

            case "Send File": //Sends file from attacker to victim, syntax: nc -v -w <timeout seconds> <IP address> <port number> < <file path>
                //File to send can be located anywhere, as long as file path is correctly specified
                try {
                    let command = `nc -${verboseFlag} -w 10 ${values.ipAddress} ${values.portNumber} < ${values.filePath}`;
                    let output = await CommandHelper.runCommand("bash", ["-c", command]); //when using '<', command needs to be run via bash shell to recognise that '<' is an input direction
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }
                break;

            case "Receive File": //Receives file from victim to attacker, syntax: nc -lvp <port number> > <file path and file name>
                //Files can be recieved in any directory
                try {
                    let command = `nc -l${verboseFlag}p ${values.portNumber} > ${values.filePath}`;
                    let output = await CommandHelper.runCommand("bash", ["-c", command]);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;

            case "Website Port scan": //Scans a website for ports, syntax: nc -zv <hostname> <port range>
                args = [`-z${verboseFlag}`]; //PLease only use website portscan on a website/Domain that you own
                args.push(`${values.websiteUrl}`);
                args.push(`${values.portNumber}`);

                try {
                    let output = await CommandHelper.runCommand("nc", args);
                    setOutput(output);
                } catch (e: any) {
                    setOutput(e);
                }

                break;
        }
    };

    const clearOutput = useCallback(() => {
        setOutput("");
    }, [setOutput]);

    //<ConsoleWrapper output={output} clearOutputCallback={clearOutput} /> prints the terminal on the tool
    return (
        <form onSubmit={form.onSubmit((values) => onSubmit({ ...values, netcatOptions: selectedScanOption }))}>
            <Stack>
                {UserGuide(title, description_userguide)}
                <Checkbox
                    label={"Verbose Mode"}
                    checked={checkedVerboseMode}
                    onChange={(e) => setCheckedVerboseMode(e.currentTarget.checked)}
                />
                <NativeSelect
                    value={selectedScanOption}
                    onChange={(e) => setSelectedNetcatOption(e.target.value)}
                    title={"Netcat option"}
                    data={netcatOptions}
                    required
                    placeholder={"Pick a scan option"}
                    description={"Type of scan to perform"}
                />
                {selectedScanOption === "Port Scan" && (
                    <>
                        <TextInput label={"IP address"} {...form.getInputProps("ipAddress")} />
                        <TextInput label={"Port number/Port range"} required {...form.getInputProps("portNumber")} />
                    </>
                )}
                {selectedScanOption === "Send File" && (
                    <>
                        <TextInput label={"IP address"} {...form.getInputProps("ipAddress")} />
                        <TextInput label={"Port number/Port range"} required {...form.getInputProps("portNumber")} />
                        <TextInput label={"File path"} {...form.getInputProps("filePath")} />
                    </>
                )}
                {selectedScanOption === "Receive File" && (
                    <>
                        <TextInput label={"Port number/Port range"} required {...form.getInputProps("portNumber")} />
                        <TextInput label={"File path"} {...form.getInputProps("filePath")} />
                    </>
                )}
                {selectedScanOption === "Website Port Scan" && (
                    <>
                        <TextInput label={"Port number/Port range"} required {...form.getInputProps("portNumber")} />
                        <TextInput label={"Domain name"} {...form.getInputProps("websiteUrl")} />
                    </>
                )}
                <Button type={"submit"}>start netcat</Button>
                {SaveOutputToTextFile(output)}
                <ConsoleWrapper output={output} clearOutputCallback={clearOutput} />
            </Stack>
        </form>
    );
};

export default NetcatTool;
