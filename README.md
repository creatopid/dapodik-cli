# Dapodik CLI: Fetch and Export Indonesian Education Data 📊🇮🇩

![GitHub release](https://img.shields.io/github/release/creatopid/dapodik-cli.svg) ![GitHub issues](https://img.shields.io/github/issues/creatopid/dapodik-cli.svg) ![GitHub forks](https://img.shields.io/github/forks/creatopid/dapodik-cli.svg) ![GitHub stars](https://img.shields.io/github/stars/creatopid/dapodik-cli.svg)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Data Structure](#data-structure)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

Dapodik CLI is a command-line tool designed to fetch and export education data from Indonesia. It supports Dapodik and Kemdikbud references and allows users to obtain data in CSV and JSON formats. This tool provides detailed insights into multi-level regions and schools. Please note that this project is not affiliated with Kemdikbud and is intended for educational and research purposes.

You can download the latest version from the [Releases](https://github.com/creatopid/dapodik-cli/releases) section.

## Features

- Fetches data from Dapodik and Kemdikbud.
- Exports data in both CSV and JSON formats.
- Supports multi-level region queries.
- Provides detailed information about schools.
- Lightweight and easy to use.
- Ideal for educational research and analysis.

## Installation

To install Dapodik CLI, follow these steps:

1. Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
2. Clone this repository using the following command:

   ```bash
   git clone https://github.com/creatopid/dapodik-cli.git
   ```

3. Navigate to the cloned directory:

   ```bash
   cd dapodik-cli
   ```

4. Install the required dependencies:

   ```bash
   npm install
   ```

5. You can also download the latest release from the [Releases](https://github.com/creatopid/dapodik-cli/releases) section. Once downloaded, execute the file to run the tool.

## Usage

To use Dapodik CLI, open your terminal and run the following command:

```bash
node index.js
```

This will display the available commands and options. You can use the tool to fetch data based on your requirements.

## Commands

Here are the available commands you can use with Dapodik CLI:

### Fetch Data

To fetch data, use the following command:

```bash
node index.js fetch --region [region_code] --school [school_code]
```

- `--region`: Specify the region code you want to fetch data from.
- `--school`: Specify the school code for detailed information.

### Export Data

To export the fetched data, use the command:

```bash
node index.js export --format [csv|json]
```

- `--format`: Choose the format you want to export the data in, either CSV or JSON.

### Help

To get help on commands, use:

```bash
node index.js help
```

This will display a list of all commands and options available.

## Data Structure

The data fetched by Dapodik CLI is structured in a way that is easy to understand. Here’s a brief overview of the key components:

- **Regions**: Each region contains information about its schools and educational statistics.
- **Schools**: Each school entry includes details such as name, address, and student count.
- **Statistics**: The tool also provides statistical data related to education in the specified region.

The data structure is designed to facilitate easy analysis and reporting.

## Contributing

We welcome contributions to improve Dapodik CLI. If you want to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Create a pull request explaining your changes.

Please ensure your code follows the coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. You can view the full license [here](LICENSE).

## Support

For support, you can open an issue in the GitHub repository. You can also check the [Releases](https://github.com/creatopid/dapodik-cli/releases) section for updates and downloads.

---

Dapodik CLI is a powerful tool for researchers and educators interested in Indonesian education data. With its straightforward commands and clear output formats, it simplifies the process of data retrieval and analysis. Whether you're conducting research or simply exploring educational statistics, Dapodik CLI provides the necessary tools to get started. 

For more details, please visit the [Releases](https://github.com/creatopid/dapodik-cli/releases) section to download the latest version and explore its capabilities.