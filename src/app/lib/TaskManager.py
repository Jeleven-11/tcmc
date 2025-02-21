import asyncio


class AsyncTaskManager:
    def __init__(self, task_method):
        self._task = None
        self._pause_event = asyncio.Event()
        # self._pause_event.set()  # Start unpaused
        self.task_method = task_method

    async def _task_runner(self, startImmediately = False):
        while True:
            if not startImmediately:
                print("Waiting")
                await self._pause_event.wait()  # Wait until unpaused
            print("Running")
            await self.task_method()  # Call the provided task method
            await asyncio.sleep(1)  # Simulate work

    def start_task(self, startImmediately):
        if self._task is None:
            self._task = asyncio.create_task(self._task_runner(startImmediately))
            print("Task started.")

    def pause_task(self):
        self._pause_event.clear()
        print("Task paused.")

    def resume_task(self):
        self._pause_event.set()
        print("Task resumed.")

    def cancel_task(self):
        if self._task:
            self._task.cancel()
            self._task = None
            print("Task canceled.")

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.cancel_task()