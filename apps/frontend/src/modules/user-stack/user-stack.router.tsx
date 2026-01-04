import CreateUserStackPage from "@frontend/modules/user-stack/pages/CreateUserStack.page";
import EditUserStackPage from "@frontend/modules/user-stack/pages/EditUserStack.page";
import UserStackPage from "@frontend/modules/user-stack/pages/UserStack.page";
import UserStackDetailPage from "@frontend/modules/user-stack/pages/UserStackDetail.page";
import { Route, Routes } from "react-router";

const UserStackRouter = () => {
	return (
		<Routes>
			<Route path="/" element={<UserStackPage />} />
			<Route path="/new" element={<CreateUserStackPage />} />
			<Route path="/:stackId" element={<UserStackDetailPage />} />
			<Route path="/edit/:stackId" element={<EditUserStackPage />} />
		</Routes>
	);
};

export default UserStackRouter;