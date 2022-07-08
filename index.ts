import * as azuread from "@pulumi/azuread";
import { local } from "@pulumi/command";
import { v4 as uuidV4 } from "uuid";

export = async() => {

    const config = await azuread.getClientConfig({});
    
    // use a static display name to facilitate group create/delete/lookup
    const displayName = "some-group";

    // specify create/delete using az cli; can add update to include other data points
    // alternatively, azure SDK could be used in place of @pulumi/command
    const groupCmd = new local.Command("group-cmd", {
        create: `az ad group create --display-name ${displayName} --mail-nickname ${uuidV4()}`,
        delete: `az ad group delete -g ${displayName}`
    });

    // wait for groupCmd to complete before lookup to avoid race condition which fails on create
    const group = groupCmd.id.apply(async cmd => {
        return await azuread.getGroup({
            displayName: displayName,
            securityEnabled: true
        })
    });

    // alternatively, 'stdout' contains the raw JSON output from Azure's API. You could parse this JSON and return any data required
    // const group = groupCmd.stdout.apply(out => {
    //     console.log(out);
    // });

    return {
        "group": group.displayName,
    };
}