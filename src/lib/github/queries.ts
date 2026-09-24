import { gql } from "graphql-request";

/**
 * Fetches everything the dashboard needs for its overview in a single
 * round trip: the contribution calendar (heatmap) and the viewer's own
 * repositories (repo filter list + language distribution). Costs ~1-2
 * GraphQL points, well inside the 5000/hour budget.
 */
export const VIEWER_OVERVIEW_QUERY = gql`
  query ViewerOverview($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      repositories(
        first: 100
        ownerAffiliation: OWNER
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          nameWithOwner
          isPrivate
          isFork
          pushedAt
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
`;
