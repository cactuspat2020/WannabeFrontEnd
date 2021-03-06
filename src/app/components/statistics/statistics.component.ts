import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import { Ranking } from '../../services/statistics.service';
import { PlayersRemaining } from '../../services/statistics.service';
import { Chart } from '../../../../node_modules/chart.js';
import { OwnerRecord } from '../../models/ownerRecord';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  statasticsService: StatisticsService;
  wannabeDAO: WannabeDAOService;
  ranking: Ranking[];
  myBarChart: Chart;
  teams: OwnerRecord[];
  spiderTeamSelection = 'all';
  spiderData: Map<string, Map<string, number>>;

  playerMap: Map<string, PlayersRemaining>;
  playerMapKeys;

  dataLoaded = true;
  startersOnly = false;
  startersOnlySelection;

  constructor(stasticsService: StatisticsService, wannabe: WannabeDAOService) {
    this.statasticsService = stasticsService;
    this.wannabeDAO = wannabe;
  }

  ngOnInit() {
    this.wannabeDAO.fetchTeams().subscribe((teamList: OwnerRecord[]) => {
      this.teams = teamList;
    });

    this.statasticsService.getRemainingByStatus().subscribe((remainingPlayers: Map<string, PlayersRemaining>) => {
      this.playerMap = remainingPlayers;
      this.playerMapKeys = Array.from(remainingPlayers.keys());
    });

    this.statasticsService.getPowerRankings(this.startersOnly).subscribe((draftData: Ranking[]) => {
      const barChart = this.buildPowerRankingChart(draftData);
    });

    this.statasticsService.getSpiderData(this.startersOnly).subscribe((spiderData: Map<string, Map<string, number>>) => {
      this.spiderData = spiderData;
      const spiderChart = this.buildSpiderChart(this.wannabeDAO.getDraftOwner(), spiderData);
    });
  }

  refresh() {
   this.ngOnInit();
  }

  setStatScope() {
    this.startersOnly = this.startersOnlySelection === 'true';
    this.statasticsService.getPowerRankings(this.startersOnly).subscribe((draftData: Ranking[]) => {
      const barChart = this.buildPowerRankingChart(draftData);
    });

    this.statasticsService.getSpiderData(this.startersOnly).subscribe((spiderData: Map<string, Map<string, number>>) => {
      this.spiderData = spiderData;
      const spiderChart = this.buildSpiderChart(this.wannabeDAO.getDraftOwner(), spiderData);
    });
  }

  selectPlayers() {
    if (this.spiderTeamSelection !== 'all') {
      this.buildSpiderChart(this.spiderTeamSelection, this.spiderData);
    }
  }

  /************************************/
  // Build the Power Ranking Chart chart
  /************************************/
  buildPowerRankingChart(draftData: Ranking[]): Chart {
    const teamNames = [];
    const projections = [];
    draftData.map(x => teamNames.push(x.teamName));
    draftData.map(x => projections.push(x.fantasyPoints));

    const ctx = document.getElementById('barChart');
    const myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: teamNames,
        datasets: [{
          data: projections,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)',
            'rgba(0, 255, 0, 0.2)',
            'rgba(0, 0, 255, 0.2)',
            'rgba(255, 255, 0, 0.2)',
            'rgba(255, 0, 255, 0.2)',
            'rgba(0, 255, 255, 0.2)',
            'rgba(128, 0, 0, 0.2)',
            'rgba(0, 128, 0, 0.2)',
            'rgba(0, 0, 128, 0.2)',
            'rgba(128, 128, 0, 0.2)',
            'rgba(128, 0, 128, 0.2)',
            'rgba(0, 128, 128, 0.2)'
          ],
          borderColor: [
            'rgba(255, 0, 0, 1)',
            'rgba(0, 255, 0, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(255, 255, 0, 1)',
            'rgba(255, 0, 255, 1)',
            'rgba(0, 255, 255, 1)',
            'rgba(128, 0, 0, 1)',
            'rgba(0, 128, 0, 1)',
            'rgba(0, 0, 128, 1)',
            'rgba(128, 128, 0, 1)',
            'rgba(128, 0, 128, 1)',
            'rgba(0, 128, 128, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        legend: { display: false },
        barPercentage: 0.5,
        barThickness: 6,
        // maxBarThickness: 8,
        scales: {
          xAxes: [{ ticks: { beginAtZero: true } }],
          yAxes: [{ ticks: { beginAtZero: false } }]
        }
      }
    });
    return myChart;
  }

/************************************/
  // Build the Spider chart
  /************************************/
  buildSpiderChart(team: string, spiderData: Map<string, Map<string, number>>): Chart {
    const averages = spiderData.get('averages');
    const teamData = spiderData.get(team);

    // const ctx = document.getElementById('spiderChart');
    const ctx = document.getElementById('spiderChart');
    const myChart = new Chart(ctx, {
      type: 'radar',
      showTooltips: false,
      multiTooltipTemplate: "<%= value %>",
      data: {
        labels: ['QB', 'RB', 'Rec', 'DST', 'K'],
        datasets: [{
          data: Array.from(averages.values()),
          // data: [2, 3, 2.5, 2, 3],
          backgroundColor: [ 'rgba(255, 0, 0, 0.2)' ],
          borderColor: [ 'rgba(255, 0, 0, 1)' ],
          borderWidth: 1,
          label: 'Average'
        }, {
          data: Array.from(teamData.values()),
          // data: [3, 2, 1.5, 2, 3.5],
          labels: Array.from(teamData.values()),
          backgroundColor: [ 'rgba(0, 255, 0, 0.2)' ],
          borderColor: [ 'rgba(0, 0, 255, 1)' ],
          borderWidth: 1,
          label: team
        }
      ]
      },
      options: {
        responsive: true,
        legend: { display: true },
        events: [],
        scale: {
          ticks: {
            min: 0,
            stepSize: .2 },
        },
        tooltips: {
          mode: 'point',
          intersect: false
      },
      hover: {
        mode: 'index',
        intersect: false
     }
      }
    });
    return myChart;
  }

}
