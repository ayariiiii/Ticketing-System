import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

export default function Profile() {

  const { user } = useAuth();

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Profile
      </h1>

      <Card title="User Information">

        <p>
          <strong>Name:</strong>{" "}
          {user?.name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.role}
        </p>

      </Card>

    </div>
  );
}