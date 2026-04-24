import Card from "../components/Card";

export default function Settings() {

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Admin Settings
      </h1>

      <Card title="System Settings">

        <p>
          Settings panel for admin controls.
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Future modules:
        </p>

        <ul className="list-disc ml-5 text-sm text-gray-600">

          <li>User Management</li>

          <li>System Preferences</li>

          <li>Backup Tools</li>

        </ul>

      </Card>

    </div>
  );
}