from setuptools import setup, find_packages

setup(
    name='grid_web_app',  # Replace with your project name
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'flask',
        # Add other dependencies here
    ],
    entry_points={
        'console_scripts': [
            'grid_web_app=app:main',  # Replace with your main script
        ],
    },
)
