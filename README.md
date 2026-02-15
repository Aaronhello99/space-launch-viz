# Space Launch Visualizer

## Deployment
To deploy this project to GitHub Pages, follow these steps:

1.  **Create a new repository on GitHub:**
    - Go to [GitHub.com/new](https://github.com/new)
    - Name your repository (e.g., `space-launch-viz`)
    - **Do not** initialize with a README, .gitignore, or license (we already have them)

2.  **Push your code:**
    Open your terminal in this project folder and run:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/space-launch-viz.git
    git branch -M main
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` and `space-launch-viz` with your actual username and repo name)*

3.  **Activate GitHub Pages:**
    - Go to your repository **Settings** > **Pages**
    - Under **Source**, select `main` branch
    - Click **Save**
    - Your site will be live at `https://YOUR_USERNAME.github.io/space-launch-viz/`

## Project Structure
This project visualizes 67 years of spaceflight history using interactive charts.

## How to Run
1.  Open the `space_launch_viz` folder.
2.  Double-click **`index.html`** to open it in your web browser (Chrome, Safari, Firefox).
3.  No internet connection is required for the data (it's embedded), but an internet connection **is required** to load the Plotly.js library and Google Fonts.

## Visualizations Included
1.  **The Exponential Frontier**: Zoomable line chart of annual launches.
2.  **Shifting Titans**: Animated racing bar chart of cumulative launches.
3.  **The Global Space Club**: Interactive map showing the spread of space capabilities.
4.  **Dominance & Diversity**: 100% stacked area chart of market share.
5.  **The Modern Hierarchy**: Treemap of 2024 launches.

## Data Source
-   Original Data: United Nations Office for Outer Space Affairs (2025)
-   Processed via: Our World in Data
