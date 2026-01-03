import CreateUserStackPage from "@frontend/modules/user-stack/pages/CreateUserStack.page";
import UserStackPage from "@frontend/modules/user-stack/pages/UserStack.page";
import UserStackDetailPage from "@frontend/modules/user-stack/pages/UserStackDetail.page";
import { Route, Routes } from "react-router";

const UserStackRouter = () => {
	return (
		<Routes>
			<Route path="/" element={<UserStackPage />} />
			<Route path="/:stackId" element={<UserStackDetailPage />} />
			<Route path="/new" element={<CreateUserStackPage />} />
		</Routes>
	);
};

export default UserStackRouter;