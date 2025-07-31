const NotificationsPanel = ({notifications}) => {
    return (
        <>
            {notifications.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                    <div className="space-y-2">
                    {notifications.slice(-5).map((notification, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                        {notification}
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </>
    )
}
export default NotificationsPanel;