function getCLIArgsQJS(): string[] | null
{
    try
    {
        return scriptArgs;
    }
    catch (err)
    {
        console.error('Cannot detect QuickJS runtime: ', err);
        return null;
    }
}

function getCLIArgsNode(): string[] | null
{
    try
    {
        return process.argv.slice(2);
    }
    catch (err)
    {
        console.error('Cannot detect Node runtime: ', err);
        return null;
    }
}

export function getCLIArguments(): string[]
{
    return getCLIArgsQJS() ?? getCLIArgsNode() ?? [];
}
