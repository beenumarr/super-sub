import { ConfigItem } from './ConfigItem';

interface VtPassConfigProps {
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    data: Record<string, string | number | undefined>;
}

export default function VtPassConfig({ handleOnChange, data }: VtPassConfigProps) {
    return (
        <section className="mb-6 mt-4 w-full pb-6">
            <div className="rounded-t-md bg-muted px-4 py-2">
                <h3 className="text-lg font-medium">Vtpass Api Configurations</h3>
            </div>
            <div className="space-y-4 rounded-b-md border border-t-0 p-4">
                <ConfigItem
                    label="Username"
                    name="vtpass_username"
                    value={data['vtpass_username']}
                    handleOnChange={handleOnChange}
                />
                <ConfigItem
                    label="Password"
                    name="vtpass_password"
                    value={data['vtpass_password']}
                    handleOnChange={handleOnChange}
                />
            </div>
        </section>
    );
}
